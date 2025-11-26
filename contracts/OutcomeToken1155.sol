// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1155Receiver} from "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import {IERC1155MetadataURI} from "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title OutcomeToken1155
 * @author Hemi Prediction Markets
 * @notice Single ERC-1155 contract representing all outcome tokens for all prediction markets
 * @dev TokenIds are derived deterministically from marketId and outcomeIndex:
 *      tokenId = (uint256(marketId) << 8) | uint256(outcomeIndex)
 * 
 * Architecture:
 * - One contract for all markets - no per-market token deployments
 * - TokenIds encode both market identity and outcome index
 * - Supports up to 256 outcomes per market (uint8 outcomeIndex)
 * 
 * Security Model:
 * - Minters are set at deployment time and are IMMUTABLE
 * - No owner, admin, or governance functions after deployment
 * - No pause mechanism - fully unstoppable
 * - Fully permissionless for transfers and approvals
 * - Only authorized minters (MarketCore, FpmmAMM) can mint/burn
 * 
 * Gas Optimizations:
 * - Custom implementation avoiding OpenZeppelin ERC1155 overhead
 * - O(1) balance lookups and single-token operations
 * - Unchecked arithmetic where overflow is impossible
 * - No redundant storage reads
 */
contract OutcomeToken1155 is IERC1155, IERC1155MetadataURI {
    // ============ Errors ============
    
    /// @notice Caller is not an authorized minter
    error NotAuthorizedMinter();
    
    /// @notice Transfer amount exceeds balance
    error InsufficientBalance();
    
    /// @notice Cannot transfer to zero address
    error TransferToZeroAddress();
    
    /// @notice Input arrays have different lengths
    error ArrayLengthMismatch();
    
    /// @notice Caller is not owner or approved operator
    error NotOwnerOrApproved();
    
    /// @notice ERC1155Receiver rejected the transfer
    error ERC1155ReceiverRejected();
    
    /// @notice Target contract does not implement ERC1155Receiver
    error NotERC1155Receiver();
    
    /// @notice Cannot approve self as operator
    error SelfApproval();

    // ============ Storage ============
    
    /// @notice Token balances: tokenId => account => balance
    /// @dev Primary storage for all token balances across all markets
    mapping(uint256 => mapping(address => uint256)) private _balances;
    
    /// @notice Operator approvals: account => operator => approved
    /// @dev Allows operators to transfer any tokens on behalf of account
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    /// @notice Authorized minters - immutable after deployment
    /// @dev Only these addresses can call mint/burn functions
    mapping(address => bool) public isMinter;
    
    /// @notice Base URI for token metadata
    /// @dev Clients should append tokenId for specific metadata
    string private _uri;

    // ============ Constructor ============
    
    /**
     * @notice Deploy the OutcomeToken1155 contract with immutable minters
     * @param minters Array of addresses authorized to mint/burn tokens
     * @param uri_ Base URI for token metadata (e.g., IPFS gateway)
     * @dev Minters cannot be changed after deployment - system is ungoverned
     *      Typically minters = [MarketCore, FpmmAMM]
     */
    constructor(address[] memory minters, string memory uri_) {
        _uri = uri_;
        
        // Set all minters - this is permanent and immutable
        // Loop only runs at deployment, not during runtime operations
        uint256 length = minters.length;
        for (uint256 i = 0; i < length;) {
            isMinter[minters[i]] = true;
            unchecked { ++i; }
        }
    }

    // ============ ERC-165 Interface Detection ============
    
    /**
     * @notice Check interface support for ERC-165 compliance
     * @param interfaceId The interface identifier to check
     * @return True if the interface is supported
     */
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

    // ============ ERC-1155 View Functions ============
    
    /**
     * @notice Get the balance of a specific token for an account
     * @param account The address to query
     * @param id The token ID (encodes marketId and outcomeIndex)
     * @return The token balance
     */
    function balanceOf(address account, uint256 id) external view returns (uint256) {
        return _balances[id][account];
    }
    
    /**
     * @notice Get balances for multiple account/token pairs
     * @param accounts Array of addresses to query
     * @param ids Array of token IDs to query
     * @return Array of balances corresponding to each account/id pair
     * @dev Arrays must have equal length
     */
    function balanceOfBatch(
        address[] calldata accounts,
        uint256[] calldata ids
    ) external view returns (uint256[] memory) {
        if (accounts.length != ids.length) revert ArrayLengthMismatch();
        
        uint256[] memory batchBalances = new uint256[](accounts.length);
        
        uint256 length = accounts.length;
        for (uint256 i = 0; i < length;) {
            batchBalances[i] = _balances[ids[i]][accounts[i]];
            unchecked { ++i; }
        }
        
        return batchBalances;
    }
    
    /**
     * @notice Check if an operator is approved for all tokens of an account
     * @param account The token owner
     * @param operator The operator address to check
     * @return True if operator is approved for all tokens
     */
    function isApprovedForAll(address account, address operator) external view returns (bool) {
        return _operatorApprovals[account][operator];
    }
    
    /**
     * @notice Get the metadata URI for a token
     * @return The URI string
     * @dev Returns base URI; clients should construct full URI as baseURI + tokenId
     *      Token ID parameter is unused - same base URI for all tokens
     */
    function uri(uint256 /* id */) external view returns (string memory) {
        return _uri;
    }

    // ============ ERC-1155 Approval Functions ============
    
    /**
     * @notice Set or revoke operator approval for all tokens
     * @param operator The operator address to approve/revoke
     * @param approved True to approve, false to revoke
     * @dev Operator can transfer any of caller's tokens when approved
     */
    function setApprovalForAll(address operator, bool approved) external {
        if (operator == msg.sender) revert SelfApproval();
        
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    // ============ ERC-1155 Transfer Functions ============
    
    /**
     * @notice Safely transfer tokens from one address to another
     * @param from Source address (must be caller or caller must be approved)
     * @param to Destination address
     * @param id Token ID to transfer
     * @param amount Amount of tokens to transfer
     * @param data Additional data for receiver callback
     * @dev Calls onERC1155Received on receiver if it's a contract
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external {
        if (to == address(0)) revert TransferToZeroAddress();
        if (from != msg.sender && !_operatorApprovals[from][msg.sender]) {
            revert NotOwnerOrApproved();
        }
        
        _transfer(from, to, id, amount);
        
        emit TransferSingle(msg.sender, from, to, id, amount);
        
        _checkOnERC1155Received(msg.sender, from, to, id, amount, data);
    }
    
    /**
     * @notice Safely batch transfer multiple token types
     * @param from Source address (must be caller or caller must be approved)
     * @param to Destination address
     * @param ids Array of token IDs to transfer
     * @param amounts Array of amounts to transfer (parallel to ids)
     * @param data Additional data for receiver callback
     * @dev Calls onERC1155BatchReceived on receiver if it's a contract
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external {
        if (to == address(0)) revert TransferToZeroAddress();
        if (ids.length != amounts.length) revert ArrayLengthMismatch();
        if (from != msg.sender && !_operatorApprovals[from][msg.sender]) {
            revert NotOwnerOrApproved();
        }
        
        uint256 length = ids.length;
        for (uint256 i = 0; i < length;) {
            _transfer(from, to, ids[i], amounts[i]);
            unchecked { ++i; }
        }
        
        emit TransferBatch(msg.sender, from, to, ids, amounts);
        
        _checkOnERC1155BatchReceived(msg.sender, from, to, ids, amounts, data);
    }

    // ============ Minter Functions (Restricted) ============
    
    /**
     * @notice Mint tokens to an address
     * @param to Recipient address
     * @param id Token ID to mint
     * @param amount Amount to mint
     * @param data Additional data for receiver callback
     * @dev Only callable by authorized minters (MarketCore, FpmmAMM)
     */
    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) external {
        if (!isMinter[msg.sender]) revert NotAuthorizedMinter();
        if (to == address(0)) revert TransferToZeroAddress();
        
        _balances[id][to] += amount;
        
        emit TransferSingle(msg.sender, address(0), to, id, amount);
        
        _checkOnERC1155Received(msg.sender, address(0), to, id, amount, data);
    }
    
    /**
     * @notice Batch mint multiple token types to an address
     * @param to Recipient address
     * @param ids Array of token IDs to mint
     * @param amounts Array of amounts to mint (parallel to ids)
     * @param data Additional data for receiver callback
     * @dev Only callable by authorized minters
     */
    function mintBatch(
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) external {
        if (!isMinter[msg.sender]) revert NotAuthorizedMinter();
        if (to == address(0)) revert TransferToZeroAddress();
        if (ids.length != amounts.length) revert ArrayLengthMismatch();
        
        uint256 length = ids.length;
        for (uint256 i = 0; i < length;) {
            _balances[ids[i]][to] += amounts[i];
            unchecked { ++i; }
        }
        
        emit TransferBatch(msg.sender, address(0), to, ids, amounts);
        
        _checkOnERC1155BatchReceived(msg.sender, address(0), to, ids, amounts, data);
    }
    
    /**
     * @notice Burn tokens from an address
     * @param from Address to burn from
     * @param id Token ID to burn
     * @param amount Amount to burn
     * @dev Only callable by authorized minters
     *      Minter must be approved operator or burning from self
     */
    function burn(
        address from,
        uint256 id,
        uint256 amount
    ) external {
        if (!isMinter[msg.sender]) revert NotAuthorizedMinter();
        if (from != msg.sender && !_operatorApprovals[from][msg.sender]) {
            revert NotOwnerOrApproved();
        }
        
        uint256 balance = _balances[id][from];
        if (balance < amount) revert InsufficientBalance();
        
        unchecked {
            _balances[id][from] = balance - amount;
        }
        
        emit TransferSingle(msg.sender, from, address(0), id, amount);
    }
    
    /**
     * @notice Batch burn multiple token types from an address
     * @param from Address to burn from
     * @param ids Array of token IDs to burn
     * @param amounts Array of amounts to burn (parallel to ids)
     * @dev Only callable by authorized minters
     *      Minter must be approved operator or burning from self
     */
    function burnBatch(
        address from,
        uint256[] calldata ids,
        uint256[] calldata amounts
    ) external {
        if (!isMinter[msg.sender]) revert NotAuthorizedMinter();
        if (ids.length != amounts.length) revert ArrayLengthMismatch();
        if (from != msg.sender && !_operatorApprovals[from][msg.sender]) {
            revert NotOwnerOrApproved();
        }
        
        uint256 length = ids.length;
        for (uint256 i = 0; i < length;) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];
            uint256 balance = _balances[id][from];
            
            if (balance < amount) revert InsufficientBalance();
            
            unchecked {
                _balances[id][from] = balance - amount;
                ++i;
            }
        }
        
        emit TransferBatch(msg.sender, from, address(0), ids, amounts);
    }

    // ============ Internal Functions ============
    
    /**
     * @dev Internal transfer logic - updates balances
     * @param from Source address
     * @param to Destination address
     * @param id Token ID
     * @param amount Amount to transfer
     */
    function _transfer(
        address from,
        address to,
        uint256 id,
        uint256 amount
    ) private {
        uint256 fromBalance = _balances[id][from];
        if (fromBalance < amount) revert InsufficientBalance();
        
        unchecked {
            _balances[id][from] = fromBalance - amount;
        }
        _balances[id][to] += amount;
    }
    
    /**
     * @dev Verify receiver contract implements ERC1155Receiver
     * @param operator Address that initiated the transfer
     * @param from Source address
     * @param to Destination address
     * @param id Token ID
     * @param amount Amount transferred
     * @param data Additional data
     */
    function _checkOnERC1155Received(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes calldata data
    ) private {
        if (to.code.length > 0) {
            try IERC1155Receiver(to).onERC1155Received(operator, from, id, amount, data) returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155Received.selector) {
                    revert ERC1155ReceiverRejected();
                }
            } catch Error(string memory) {
                revert NotERC1155Receiver();
            } catch {
                revert NotERC1155Receiver();
            }
        }
    }
    
    /**
     * @dev Verify receiver contract implements ERC1155Receiver for batch transfers
     * @param operator Address that initiated the transfer
     * @param from Source address
     * @param to Destination address
     * @param ids Array of token IDs
     * @param amounts Array of amounts
     * @param data Additional data
     */
    function _checkOnERC1155BatchReceived(
        address operator,
        address from,
        address to,
        uint256[] calldata ids,
        uint256[] calldata amounts,
        bytes calldata data
    ) private {
        if (to.code.length > 0) {
            try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, amounts, data) returns (bytes4 response) {
                if (response != IERC1155Receiver.onERC1155BatchReceived.selector) {
                    revert ERC1155ReceiverRejected();
                }
            } catch Error(string memory) {
                revert NotERC1155Receiver();
            } catch {
                revert NotERC1155Receiver();
            }
        }
    }

    // ============ Utility Functions ============
    
    /**
     * @notice Compute the token ID for a market outcome
     * @param marketId The market identifier (bytes32)
     * @param outcomeIndex The outcome index (0 to numOutcomes-1)
     * @return tokenId The ERC-1155 token ID
     * @dev Pure function - can be called off-chain for gas-free computation
     *      Token ID structure: [marketId (248 bits)][outcomeIndex (8 bits)]
     */
    function computeOutcomeTokenId(
        bytes32 marketId,
        uint8 outcomeIndex
    ) external pure returns (uint256) {
        return _computeOutcomeTokenId(marketId, outcomeIndex);
    }
    
    /**
     * @dev Internal token ID computation
     * @param marketId The market identifier
     * @param outcomeIndex The outcome index
     * @return Token ID with marketId in upper 248 bits and outcomeIndex in lower 8 bits
     */
    function _computeOutcomeTokenId(
        bytes32 marketId,
        uint8 outcomeIndex
    ) internal pure returns (uint256) {
        return (uint256(marketId) << 8) | uint256(outcomeIndex);
    }
}
