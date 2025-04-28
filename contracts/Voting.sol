// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Poll {
        string name;
        string[] options;
        uint256 deadline;
        uint256[] votes;
    }

    Poll[] public polls;
    mapping(uint => mapping(address => bool)) public voted;

    event PollCreated(uint id, string name);
    event Voted(uint id, address voter, uint option);

    function createPoll(string memory _name, string[] memory _opts, uint _duration) external {
        Poll storage p = polls.push();
        p.name = _name;
        p.options = _opts;
        p.deadline = block.timestamp + _duration;
        p.votes = new uint256[](_opts.length); // Initialisation votes
        emit PollCreated(polls.length - 1, _name);
    }

    function vote(uint id, uint opt) external {
        Poll storage p = polls[id];
        require(block.timestamp < p.deadline, "Poll closed"); // Check deadline
        require(!voted[id][msg.sender], "Already voted"); // Check double-vote
        voted[id][msg.sender] = true;
        p.votes[opt]++;
        emit Voted(id, msg.sender, opt);
    }

    function results(uint id) external view returns (uint[] memory) {
        return polls[id].votes;
    }
}
