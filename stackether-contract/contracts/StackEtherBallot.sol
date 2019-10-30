pragma solidity >=0.4.22 <0.6.0;

contract StackEtherBallot
{
    /// ---- Mainting 2 types of Users ----///
    enum Status {General, Moderator}
    
    
    /// ---- User properties ----///
    struct User
    {
        uint8 weight;
        bool isEligible;
        uint8 vote;
        Status stat;
    }
    mapping(address => User) users;
    
    ///---- For keeping a count of all performers who give Answers(Candidates for getting voted) ----///
    struct Performer
    {
        uint votes;
    }
    Performer[] performers;
    
    ///---- Admin ----///
    address admin_add;
    
    ///---- Modifier to provide access only when Admin executes the contract ----///
    modifier onlyAdmin()
    {
        require(msg.sender == admin_add);
      _;
    }
    
    ///---- Smart contract deployed for the first time ----///
    constructor(uint8 numPerformers) public
    {
        admin_add = msg.sender;
        performers.length = numPerformers;
        users[admin_add].isEligible = true;
        users[admin_add].stat = Status.Moderator;
        users[admin_add].weight = 2;
    }
    
    
   ///---- Any User registers for the first time ----///
    function registerUser(address toVoter, uint8 role) public
    {
            users[toVoter].isEligible = true;
            if(role == 0)
            {
                users[toVoter].stat =  Status.General;    
                users[toVoter].weight = 1;
            }
            else if(role == 1)
            {
                users[toVoter].stat = Status.Moderator;
                users[toVoter].weight = 2;
            }
        
    }
    
    
    /// ---- Function for voting an Answer(UpVoting or DownVoting) ----///
    function vote(uint8 _toVote, uint8 _upVote, uint8 _downVote) public
    {
        User memory sender = users[msg.sender];
        if(sender.isEligible == false || _toVote > performers.length) return;
        
        //Remember to set upvote and downvote values to 1/0 or 0/1 in UI as per button click        
        sender.vote = _toVote;
		
		if(_upVote == 1)
			_upVote = sender.weight;
		else if(_downVote == 1)
			_downVote = sender.weight;
			
        performers[_toVote].votes += _upVote;
        performers[_toVote].votes -= _downVote;
        
    }
    
    
    ///---- Determing user with the best performance on the forum overall(The one with best Answers) ----///
    function findBestPerformer() public view returns(uint _bestPerformer)
    {
        uint maxVote = 0;
        for(uint p = 0; p<performers.length; p++)
        {
            if(performers[p].votes > maxVote)
            {
                maxVote = performers[p].votes;
                _bestPerformer = p;
                
            }
        }
    }
    
    
}