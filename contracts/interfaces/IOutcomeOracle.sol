// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IOutcomeOracle
 * @notice Standard interface for prediction market oracle adapters
 * @dev Implement this interface to create custom oracles for different question types
 */
interface IOutcomeOracle {
    /// @notice Possible outcomes for a question
    enum Outcome {
        Undefined,  // Question not yet resolved
        Yes,        // Affirmative outcome (outcome index 0)
        No,         // Negative outcome (outcome index 1)
        Invalid     // Question cannot be resolved (ambiguous, cancelled, etc.)
    }

    /**
     * @notice Request the oracle to resolve a question
     * @param questionId The unique identifier for the question
     * @dev May be called multiple times; oracle should handle idempotently
     *      Resolution may happen in the same transaction or asynchronously
     */
    function requestResolution(bytes32 questionId) external;

    /**
     * @notice Get the current outcome for a question
     * @param questionId The unique identifier for the question
     * @return outcome The resolved outcome (Undefined if not resolved)
     * @return resolved True if the question has been resolved
     * @return resolutionTime Unix timestamp when resolution occurred (0 if not resolved)
     */
    function getOutcome(bytes32 questionId) external view returns (
        Outcome outcome,
        bool resolved,
        uint64 resolutionTime
    );
}
