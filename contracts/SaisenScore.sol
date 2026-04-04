// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SaisenScore
 * @notice On-chain ELO ranking and score registry for SAISEN.
 *         Deployed on Base. Players call submitScore() after each match.
 */
contract SaisenScore {

    //  Structs 
    struct PlayerStats {
        uint256 totalScore;
        uint256 wins;
        uint256 losses;
        uint256 rating;        // ELO ?" starts at DEFAULT_RATING on first submission
        uint256 totalMatches;
        uint256 lastSubmission; // unix timestamp
    }

    //  State 
    mapping(address => PlayerStats) public players;
    address[] public registeredPlayers;

    //  Constants 
    uint256 public constant DEFAULT_RATING    = 1000;
    uint256 public constant WIN_ELO           = 20;
    uint256 public constant LOSS_ELO          = 15;
    uint256 public constant MAX_SCORE         = 55;   // anti-cheat ceiling
    uint256 public constant MIN_DURATION_SECS = 25;   // match must be >= 25s
    uint256 public constant SUBMIT_COOLDOWN   = 20;   // seconds between submissions

    //  Events 

    event ScoreSubmitted(
        address indexed player,
        uint256 score,
        bool    win,
        uint256 newRating,
        uint256 timestamp
    );

    //  External 

    /**
     * @notice Submit a match result. Player calls this directly.
     * @param score          Targets hit by player during match
     * @param win            True if player beat the bot
     * @param matchDuration  Seconds the match lasted (passed from frontend)
     */
    function submitScore(
        uint256 score,
        bool    win,
        uint256 matchDuration
    ) external {
        require(score       <= MAX_SCORE,          "Score: exceeds ceiling");
        require(matchDuration >= MIN_DURATION_SECS, "Duration: match too short");

        PlayerStats storage s = players[msg.sender];

        // Cooldown check
        require(
            block.timestamp >= s.lastSubmission + SUBMIT_COOLDOWN,
            "Cooldown: wait before resubmitting"
        );

        // First-time registration
        if (s.rating == 0) {
            s.rating = DEFAULT_RATING;
            registeredPlayers.push(msg.sender);
        }

        // Update stats
        s.totalScore  += score;
        s.totalMatches += 1;
        s.lastSubmission = block.timestamp;

        if (win) {
            s.wins   += 1;
            s.rating += WIN_ELO;
        } else {
            s.losses += 1;
            s.rating  = s.rating > LOSS_ELO ? s.rating - LOSS_ELO : 1;
        }

        emit ScoreSubmitted(msg.sender, score, win, s.rating, block.timestamp);
    }

    //  Views 
    function getPlayerStats(address player)
        external view
        returns (PlayerStats memory stats)
    {
        stats = players[player];
        if (stats.rating == 0) stats.rating = DEFAULT_RATING;
    }

    function getRegisteredCount() external view returns (uint256) {
        return registeredPlayers.length;
    }

    /**
     * @notice Batch-fetch stats for leaderboard (pass slice of registeredPlayers).
     */
    function getBatchStats(address[] calldata addrs)
        external view
        returns (PlayerStats[] memory result)
    {
        result = new PlayerStats[](addrs.length);
        for (uint256 i; i < addrs.length; ) {
            result[i] = players[addrs[i]];
            if (result[i].rating == 0) result[i].rating = DEFAULT_RATING;
            unchecked { ++i; }
        }
    }
}
