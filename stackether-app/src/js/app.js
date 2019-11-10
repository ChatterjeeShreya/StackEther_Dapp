App = {
    web3Provider: null,
    contracts: {},
    names: new Array(),
    url: 'http://127.0.0.1:7545',
    chairPerson:null,
    currentAccount:null,
  
    init: function() {
      $.getJSON('../proposal.json', function(data) {
        var proposalsRow = $('#proposalsRow');
        var proposalTemplate = $('#proposalTemplate');
        // console.table(data)
        for (i = 0; i < data.length; i ++) {
          proposalTemplate.find('.answeredbyclass').text(data[i].name);
          proposalTemplate.find('#ans').text(data[i].ans);
          proposalTemplate.find('.btn-upvote').attr('data-id', data[i].id);
          proposalTemplate.find('.btn-downvote').attr('data-id', data[i].id);
          proposalsRow.append(proposalTemplate.html()); 
          App.names.push(data[i].name);
        }
      });
      App.populateVoterType();
      return App.initWeb3();
    },
  
    initWeb3: function() {
          // Is there is an injected web3 instance?
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
      } else {
        // If no injected web3 instance is detected, fallback to the TestRPC
        App.web3Provider = new Web3.providers.HttpProvider(App.url);
      }
      web3 = new Web3(App.web3Provider);
  
      ethereum.enable();
  
      App.populateAddress();
      return App.initContract();
    },
  
    initContract: function() {
        $.getJSON('StackEtherBallot.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var voteArtifact = data;
      App.contracts.vote = TruffleContract(voteArtifact);
  
      // Set the provider for our contract
      App.contracts.vote.setProvider(App.web3Provider);
      
      App.getChairperson();
      return App.bindEvents();
    });
    },
  
    bindEvents: function() {
      $(document).on('click', '.btn-vote', function(){
       var ad = $('#enter_address').val(); 
       App.handleVote(event, ad); });      

      $(document).on('click', '#win-count', App.handleWinner);
     //----------include voter type
      $(document).on('click', '#register', function(){
         var ad = $('#enter_address').val(), vtype = $('#enter_votertype').val(); 
         App.handleRegister(ad, vtype); });
    },
  
    populateAddress : function(){
      new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts((err, accounts) => {
        jQuery.each(accounts,function(i){
          if(web3.eth.coinbase != accounts[i]){
            var optionElement = '<option value="'+accounts[i]+'">'+accounts[i]+'</option';
            jQuery('#enter_address').append(optionElement);  
          }
        });
      });
    },

    // ------------- recheck this
    populateVoterType : function(){
              jQuery('#enter_votertype').append("<option value=General>General</option");
              jQuery('#enter_votertype').append("<option value=Moderator>Moderator</option");
            
            },
  
    getChairperson : function(){
      App.contracts.vote.deployed().then(function(instance) {
        return instance;
      }).then(function(result) {
        App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
        App.currentAccount = web3.eth.coinbase;
        if(App.chairPerson != App.currentAccount){
          jQuery('#address_div').css('display','none');
          jQuery('#register_div').css('display','none');
          jQuery('#votertype_div').css('display','none');
        }else{
          jQuery('#address_div').css('display','block');
          jQuery('#register_div').css('display','block');
          jQuery('#votertype_div').css('display','block');
        }
      })
    },
    
    handleRegister: function(addr, votertype){
      var voteInstance;
      var voteTypeValue;
      App.contracts.vote.deployed().then(function(instance) {
        voteInstance = instance;
        if(votertype === "General")
          voteTypeValue = 0;
        else if(votertype === "Moderator")
          voteTypeValue = 1;  
        return voteInstance.registerUser(addr, voteTypeValue);
      }).then(function(result, err){    
          if(result){
              if(parseInt(result.receipt.status) == 1)
                // var a = 1 
              alert(addr + " registration done successfully") 
              else
                // var b = 1
              alert(addr + " registration not done successfully due to revert")
          } else {
              // var c = 1
              alert(addr + " registration failed")
          }   
      });
  },
  
    handleVote: function(event, ad) {
      console.log(ad);
      event.preventDefault();
      var proposalId = parseInt($(event.target).data('id'));
      var voteType = $(event.target)[0].value;
      var voteInstance;

      // web3.eth.getAccounts(function(error, accounts) {
        // web3.eth.getAccounts(function(error, accounts) {
          // var account = accounts[0];
  
        var account = ad;
        console.log("address passed in handlevote: ");
        console.log(account);
 
      App.contracts.vote.deployed().then(function(instance) {
          voteInstance = instance;
          if(voteType == "UpVote")
            return voteInstance.vote(proposalId, 1, 0);
          else if(voteType == "DownVote")
            return voteInstance.vote(proposalId, 0, 1);  
        }).then(function(result, err){
              if(result){
                  console.log(result.receipt.status);
                  if(parseInt(result.receipt.status) == 1)
                  alert(account + " voting done successfully")
                  // console.log("ok")
                  else
                  alert(account + " voting not done successfully due to revert")
                  // console.log("not ok ! reverted")
              } else {
                console.log("voting failed");
                  alert(account + " voting failed")
              }   
          });
        // });
    },
  
    handleWinner : function() {
      console.log("To get winner");
      var voteInstance;
      App.contracts.vote.deployed().then(function(instance) {
        voteInstance = instance;
        return voteInstance.findBestPerformer();
      }).then(function(res){
      console.table(res);
      var winner = App.names[res];
      // console.log(winner) 
        alert(App.names[res] + "  is the winner ! :)");
      }).catch(function(err){
        console.log(err.message);
      })
    }
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
  