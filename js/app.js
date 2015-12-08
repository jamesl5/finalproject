var usrbadges = [];
var myApp = angular.module('myApp', ['ui.router', 'firebase', 'angular-svg-round-progress', "ui.bootstrap", 'timer'])
var ref = new Firebase("https://info343final.firebaseio.com/");

myApp.config(function($stateProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'templates/home.html',
      controller: 'HomeController'
    })
    .state('dashboard', {
      url: '/dashboard',
      templateUrl: 'templates/dashboard.html',
      controller: 'DashboardController'
    })
	.state('timer', {
      url: '/timer',
      templateUrl: 'templates/timer.html',
      controller: 'TimerController'
    })
});

myApp.controller('HomeController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http, $location, $httpParamSerializer){
	angular.element('.slider').slider({full_width: true});
	angular.element('.parallax').parallax();

	$scope.submitClick = function() {
		var first_name = $scope.first_name;
		console.log(first_name);
		var last_name = $scope.last_name;
		console.log(last_name);
		var email = $scope.email;
		console.log(email);
		var text = $scope.textarea1;
		var req = {
			method: 'POST', 
			url: 'email.php',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			data: $httpParamSerializer({
				first_name: first_name,
				last_name: last_name,
				email: email,
				textarea1: text
			})
		};
		$http(req);
	}

	new Tether({
		element: "#signUpPopUp",
		target: "#signUp",
		attachment: 'top center',
		targetAttachment: 'bottom center'
	});

	new Tether({
		element: "#loginPopUp",
		target: "#login",
		attachment: 'top center',
		targetAttachment: 'bottom center'
	});

   // Create a variable 'ref' to reference your firebase storage
	// console.log("hello");
    var userRef = ref.child("users");

    // Create a firebaseObject of your users, and store this as part of $scope
    $scope.users = $firebaseObject(userRef);
	
    // Create authorization object that referes to firebase
    $scope.authObj = $firebaseAuth(ref);
	
    // Test if already logged in
    var authData = $scope.authObj.$getAuth();
    if (authData) {
        $scope.userId = authData.uid;
    } 
	
    // SignUp function
    $scope.signUp = function() {
        // Create user
		// Here, you set default values for users if there is any
		$scope.create = false;
		console.log("sign up");
		userbadges = ["powerbadge"];
        $scope.authObj.$createUser({
			name: $scope.name,
            email: $scope.email,
            password: $scope.password,
			badges: usrbadges
        })

        // Once the user is created, call the logIn function
        .then($scope.logIn)

        // Once logged in, set and save the user data
        .then(function(authData) {
            $scope.userId = authData.uid;
            $scope.users[authData.uid] ={
                name: $scope.name
            }
            $scope.users.$save()
        })
		.then($location.path('/dashboard'))
        // Catch any errors
        .catch(function(error) {
            console.error("Error: ", error);
			console.log(error.code);
			if(error.code == "INVALID_EMAIL"){
				alert("Email is invalid")
			}
			if(error.code == "EMAIL_TAKEN"){
				alert("Email already in use")
			}
        });
    }


    // SignIn function, reads whatever set-up the user has
    $scope.signIn = function() {
        $scope.logIn().then(function(authData){
            $scope.userId = authData.uid
			var id = $scope.userId;
			$scope.badges = $scope.users[id].badges
			$location.path('/dashboard')
        })
    }
	
    // LogIn function
    $scope.logIn = function() {
        return $scope.authObj.$authWithPassword({
            email: $scope.email,
            password: $scope.password
        })
    }
	
	usrbadges = $scope.badges;
	
    // LogOut function
    $scope.logOut = function() {
        $scope.authObj.$unauth()
        $scope.userId = false
		$location.path('/')
		$scope.badges = []
		userbadges = [];
    }

    //CREATES THE BAR CHART
    var margin = {top: 20, right: 30, bottom: 30, left: 40},
        width = 370 - margin.left - margin.right,
        height = 330 - margin.top - margin.bottom; //these are random values - no math was done to figure them out

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);    

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var chart = d3.select(".barChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("../test_data/testdata.csv", type, function(error, data) {
      if(error) throw error;

      x.domain(data.map(function(d) { return d.days; }));
      y.domain([0, d3.max(data, function(d) { return d.value; })]);

      var barWidth = width / data.length;

      chart.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + height + ")")
          .call(xAxis);

      chart.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', -30)
          .attr('x', -50)
          .style('text-anchor', 'end')
          .text('Hours');

      chart.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr('class', 'bar')
          .attr('x', function(d) { return x(d.days); })
          .attr('y', function(d) { return height; })
          .attr('height', function(d) { return 0; })
          // .attr('height', 0)
          .attr("width", x.rangeBand())
          .transition().delay(function (d, i) { return i * 100; })
          .duration(1500)
          .ease('elastic')
          .attr('y', function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); });
    });
    
    function type(d) {
      d.value = +d.value; // coerce to number
      return d;
    }  
    // END OF THE BARCHART
});

myApp.controller('DashboardController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $location, $anchorScroll) {
  // GETTING BADGES
	var authData = $scope.authObj.$getAuth();
  if (authData) {
      $scope.userId = authData.uid;
  }
  // rather than stringing all of the .childs together, we found it clearer to break
  // each step into separate variables
	var badgeRef = ref.child("allbadges");
	var userRef = ref.child("users");
	var userId = $scope.userId;
	var userobjectsRef = userRef.child(userId);
  var userGoalRef = userobjectsRef.child("goals");
	var userbadgeRef = userobjectsRef.child("badges");
  var specificGoalRef = userGoalRef.child("goal");
  var daysOfWeek = specificGoalRef.child("days");
  var totaltime = specificGoalRef.child("totaltime"); 
  var logs = specificGoalRef.child("logs");
  var specificLog = logs.child("log");

  // array of user's badges
	$scope.userbadges = $firebaseArray(userbadgeRef);
  // array of all possible badges
	$scope.allbadges = $firebaseArray(badgeRef);
  // array of user's goals
  $scope.userGoals = $firebaseArray(userGoalRef);
  console.log($scope.userGoals);
  // array of all of user's logs
  $scope.logsArray = $firebaseArray(specificGoalRef);
  console.log($scope.logsArray);
  // array of a specific log containing log details
  $scope.specificLog = $firebaseArray(specificLog);
  console.log($scope.specificLog);



  //CREATES THE BAR CHART
  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 370 - margin.left - margin.right,
      height = 330 - margin.top - margin.bottom; //these are random values - no math was done to figure them out

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);    

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom');

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

  var chart = d3.select(".barChart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append('g')
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("../test_data/testdata.csv", type, function(error, data) {
    if(error) throw error;

    x.domain(data.map(function(d) { return d.days; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    var barWidth = width / data.length;

    chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ")")
        .call(xAxis);

    chart.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -30)
        .attr('x', -50)
        .style('text-anchor', 'end')
        .text('Hours');

    chart.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d.days); })
        .attr('y', function(d) { return height; })
        .attr('height', function(d) { return 0; })
        // .attr('height', 0)
        .attr("width", x.rangeBand())
        .transition().delay(function (d, i) { return i * 100; })
        .duration(1500)
        .ease('elastic')
        .attr('y', function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
      
      chart.selectAll(".bar").append("text")
        .attr("x",  width / 2)
        .attr("y", height - 3)
        .style('text-anchor', "end")
        .text(function(d) {return d.value});

        // var yTextPadding = 20;
        // chart.selectAll(".bartext")
        // .data(data)
        // .enter()
        // .append("text")
        // .attr("class", "bartext")
        // .attr("text-anchor", "middle")
        // .attr("fill", "white")
        // .attr("x", function(d,i) {
        //     return x(i)+x.rangeBand()/2;
        // })
        // .attr("y", function(d,i) {
        //     return height-y(d)+yTextPadding;
        // })
        // .text(function(d){
        //      return d;
        // });

    // chart.selectAll(".bar").append("text")
    //     .attr("x", barWidth / 2)
    //     .attr("y", function(d) {return y(d.value) + 3;})
    //     .attr("dy", ".75em")
    //     .text(function(d) { return d.value; });
  });

  function type(d) {
    d.value = +d.value; // coerce to number
    return d;
  }  
  // END OF THE BARCHART

  $scope.curr = 55;


  // START HEATMAP
  var margin = { top: 20, right: 0, bottom: 50, left: 20 },
            heatWidth = 400 - margin.left - margin.right,
            heatHeight = 280 - margin.top - margin.bottom,
            gridSize = Math.floor(50),
            legendElementWidth = gridSize / 1.28,
            buckets = 9,
            colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
            days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            weeks = ["1", "2", "3", "4"];
            datasets = ["data.tsv"];

        var svg = d3.select("#heatmap").append("svg")
            .attr("width", heatWidth + margin.left + margin.right)
            .attr("height", heatHeight + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var weekLabels = svg.selectAll(".weeksLabel")
            .data(weeks)
            .enter().append("text")
              .text(function (d) { return d; })
              .attr("x", 0)
              .attr("y", function (d, i) { return i * gridSize; })
              .style("text-anchor", "end")
              .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
              .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

        var dayLabels = svg.selectAll(".daysLabel")
            .data(days)
            .enter().append("text")
              .text(function(d) { return d; })
              .attr("x", function(d, i) { return i * gridSize; })
              .attr("y", 0)
              .style("text-anchor", "middle")
              .attr("transform", "translate(" + gridSize / 2 + ", -6)")
              .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

        var heatmapChart = function(tsvFile) {
          d3.tsv("./test_data/hours.tsv",
          function(d) {
            return {
              weeks: +d.weeks,
              days: +d.days,
              value: +d.value
            };
          },
          function(error, data) {
            var colorScale = d3.scale.quantile()
                .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
                .range(colors);

            var cards = svg.selectAll(".hour")
                .data(data, function(d) {return d.weeks+':'+d.days;});

            cards.append("title");

            cards.enter().append("rect")
                .attr("x", function(d) { return (d.days - 1) * gridSize; })
                .attr("y", function(d) { return (d.weeks - 1) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "hour bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0]);

            cards.transition().duration(2000)
                .style("fill", function(d) { return colorScale(d.value); });

            cards.select("title").text(function(d) { return d.value; });
            
            cards.exit().remove();

            var legend = svg.selectAll(".legend")
                .data([0].concat(colorScale.quantiles()), function(d) { return d; });

            legend.enter().append("g")
                .attr("class", "legend");

            legend.append("rect")
              .attr("x", function(d, i) { return legendElementWidth * i; })
              .attr("y", heatHeight)
              .attr("width", legendElementWidth)
              .attr("height", gridSize / 2)
              .style("fill", function(d, i) { return colors[i]; });

            legend.append("text")
              .attr("class", "mono")
              .text(function(d) { return "≥ " + Math.round(d); })
              .attr("x", function(d, i) { return legendElementWidth * i; })
              .attr("y", heatHeight + gridSize);

            legend.exit().remove();

          });  
        };

        heatmapChart(datasets[0]);
        
        var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
          .data(datasets);

        datasetpicker.enter()
          .append("input")
          .attr("value", function(d){ return "Dataset " + d })
          .attr("type", "button")
          .attr("class", "dataset-button")
          .on("click", function(d) {
            heatmapChart(d);
          });
  //  END HEATMAP
});

	function stopResumeTimer(sectionId, btn) {
		console.log(btn);
		if (btn.innerHTML === 'Start') {
			document.getElementById(sectionId).getElementsByTagName('timer')[0].start();
			btn.innerHTML = 'Stop';
		}
		else if (btn.innerHTML === 'Stop') {
			document.getElementById(sectionId).getElementsByTagName('timer')[0].stop();
			btn.innerHTML = 'Resume';
		}
		else {
			document.getElementById(sectionId).getElementsByTagName('timer')[0].resume();
			btn.innerHTML = 'Stop';
		}
	}
myApp.controller('TimerController', function($scope){
	function startTimer(sectionId) {
		document.getElementById(sectionId).getElementsByTagName('timer')[0].start();
	}

	function stopTimer(sectionId) {
		document.getElementById(sectionId).getElementsByTagName('timer')[0].stop();
	}
	$scope.stopResumeTimer = function(sectionId, btn) {
		console.log(btn);
		if (btn.innerHTML === 'Start') {
			document.getElementById(sectionId).getElementsByTagName('timer')[0].start();
			btn.innerHTML = 'Stop';
		}
		else if (btn.innerHTML === 'Stop') {
			document.getElementById(sectionId).getElementsByTagName('timer')[0].stop();
			btn.innerHTML = 'Resume';
		}
		else {
			document.getElementById(sectionId).getElementsByTagName('timer')[0].resume();
			btn.innerHTML = 'Stop';
		}
	}
	$scope.linkAnchors = function () {
        $('ul.nav a').click(function (){
            var path = $(this).attr('href');
            if (path != '#') {
                window.location = path;
            }
        });
    };
    
    $scope.callbackTimer={};
    $scope.callbackTimer.status='Running';
    $scope.callbackTimer.callbackCount=0;    
    $scope.callbackTimer.finished=function(){
        $scope.callbackTimer.status='COMPLETE!!';
        $scope.callbackTimer.callbackCount++;
        $scope.$apply();
    }
	var authData = $scope.authObj.$getAuth();
	if (authData) {
		$scope.userId = authData.uid;
	}
	var userRef = ref.child("users");
	console.log("timer")
   
});

myApp.run(function ($rootScope, $state, $firebaseAuth) {
  
    $rootScope.$on('$stateChangeStart', function (event, toState, fromState) {
      var authObj = $firebaseAuth(ref);
	  var authData = authObj.$getAuth();
      
      // NOT authenticated - goes to login page
      if(!authData)
      {
		var shouldGoHome = fromState.name === "" && toState.name !== "home";
		if(shouldGoHome){
			$state.go('home')
			event.preventDefault();
		}
        return;
      }
	  if(authData){
		  return;
	  }
      
    });
});


