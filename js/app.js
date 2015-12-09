// Group 5
// Info-343
// Final Project
// December 9, 2015
// Main JavaScript for our final
// project. Here we define all of our
// controllers for our multi-page
// architecture.

// Initiate global variables, create angular module,
// and firebase reference
var usrbadges = [];
var myApp = angular.module('myApp', ['ui.router', 'firebase', 'angular-svg-round-progress', 'ui.bootstrap', 'timer']);
var ref = new Firebase("https://info343final.firebaseio.com/");

// Takes in $stateProvider to allow for
// multipage-architecture. Declares the
// different controllers and links the pages
// together.
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
    .state('signUp', {
      url: '/signUp',
      templateUrl: 'templates/signUp.html',
      controller: 'SignUpController'
    })
    .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginController'
    })
	.state('newGoal', {
		url: '/newGoal',
		templateUrl: 'templates/newGoal.html',
		controller: 'NewGoalController'
	})
});

// Logs in or signs up a user. If a user is signing up
// for the first time, they will be automatically
// logged in. This function also includes user
// authentication all based off of firebase
function logInSignUp(name, email, password, $scope, $firebaseObject, $firebaseAuth, $location, $http){
	// Create a variable 'ref' to reference your firebase storage
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
	$scope.newUserbadges = ["powerbadge"];
    // SignUp function
	$scope.signUp = function() {
        // Create user
		// Here, you set default values for users if there is any
		$scope.create = false;

		// Authenticate user
        $scope.authObj.$createUser({
            email: $scope.email,
            password: $scope.password
        })

        // Once the user is created, call the logIn function
        .then($scope.logIn)

        // Once logged in, set and save the user data
        .then(function(authData) {
			console.log($scope.newUserbadges);
            $scope.userId = authData.uid;
            $scope.users[authData.uid] = {
                name: $scope.name,
				badges: $scope.newUserbadges,
				goals: {
					0: {
						goalname: $scope.goalTitle,
						schedule: {
							0: {hours: document.getElementById("Sunday").value},
							1: {hours: document.getElementById("Monday").value},
							2: {hours: document.getElementById("Tuesday").value},
							3: {hours: document.getElementById("Wednesday").value},
							4: {hours: document.getElementById("Thursday").value},
							5: {hours: document.getElementById("Friday").value},
							6: {hours: document.getElementById("Saturday").value}
						},
						totaltime: 0
					}
				}
            }
            $scope.users.$save()
        })
		.then(function(){
			location.reload();
		})
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
			console.log($scope.userId)
			var id = $scope.userId;
			$scope.badges = $scope.users[id].badges
			location.reload();
        })
    }
	
    // LogIn function
    $scope.logIn = function() {
        return $scope.authObj.$authWithPassword({
            email: $scope.email,
            password: $scope.password
        })
    }
	
    // LogOut function
    $scope.logOut = function() {
        $scope.authObj.$unauth()
        $scope.userId = false
		$location.path('/')
		$scope.badges = []
    }
}

// Styling function for our circle graph
// dynamically changes depending upon data
// and which page the circle is on
// Takes in scope and a percent number
function getStyleFun($scope, num) {
	$scope.getStyle = function(){
	    var transform = ($scope.isSemi ? '' : 'translateY(-50%) ') + 'translateX(-50%)';

	    return {
	        'top': $scope.isSemi ? 'auto' : num,
	        'bottom': $scope.isSemi ? '5%' : 'auto',
	        'left': '50%',
	        'transform': transform,
	        '-moz-transform': transform,
	        '-webkit-transform': transform,
	        'font-size': $scope.radius/3.5 + 'px'
	    };
	};
}

// Signs up the user from the sign up page
// saves their data in firebase and allows
// them to create a new goal.
myApp.controller('SignUpController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http, $location) {
	var name = $scope.name;
	var email = $scope.email;
	var password = $scope.password;
   	logInSignUp(name, email, password, $scope, $firebaseObject, $firebaseAuth, $location, $http);
   	$scope.weekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
});

// Logs in user from the log in page
myApp.controller('LoginController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http, $location) {
	var name = $scope.name;
	var email = $scope.email;
	var password = $scope.password;
   	logInSignUp(name, email, password, $scope, $firebaseObject, $firebaseAuth, $location, $http);
});

// Creates a new goal
myApp.controller('NewGoalController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http, $location) {
	$scope.weekArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	console.log($scope.userId); 
	var userRef = ref.child("users");
	var userId = $scope.userId;
	var userobjectsRef = userRef.child(userId);
	var userGoalsRef = userobjectsRef.child("goals");
	console.log(userGoalsRef);
	var goalsArray = $firebaseArray(userGoalsRef);
	console.log(goalsArray);
	console.log(goalsArray.length);
	$scope.createGoal = function(){
		goalsArray.$add({	
			goalname: $scope.goalTitle,
			schedule: {
				0: {hours: document.getElementById("Sunday").value},
				1: {hours: document.getElementById("Monday").value},
				2: {hours: document.getElementById("Tuesday").value},
				3: {hours: document.getElementById("Wednesday").value},
				4: {hours: document.getElementById("Thursday").value},
				5: {hours: document.getElementById("Friday").value},
				6: {hours: document.getElementById("Saturday").value}
			},
			totaltime: 0
		});
	}
});

// Controls the functionality of our home page
// This includes the image styling, the carousel,
// and creates the circle and bar graphs.
myApp.controller('HomeController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http, $location, $httpParamSerializer){
	angular.element('.slider').slider({full_width: true});
	angular.element('.parallax').parallax();
	var num = "50%";
	getStyleFun($scope, num);

	// Submits contact us data to php
	// file and sends email to katrina
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

	// Logs user in
	var name = $scope.name;
	var email = $scope.email;
	var password = $scope.password;
   	logInSignUp(name, email, password, $scope, $firebaseObject, $firebaseAuth, $location, $http);
    
    // creates the bar chart
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
});

// Controls our dashboard page
// Creates calendar, timer, circle graph,
// bar graph, and displays badges.
myApp.controller('DashboardController', function($scope, $firebase, $firebaseAuth, $firebaseArray, $firebaseObject, $location, $anchorScroll) {

	// Styles circle graph
	var num = "60%";
	getStyleFun($scope, num);

	// Get today's date and convert to milliseconds
	var today = new Date();
	var milliseconds = today.getTime();
	var date = today.getDate();
	var day = today.getDay();
	var week = 0;
	if (date == 31 || date == 30){
	if (day == 0 || day == 1){
		week = 6;
	}
	} else{
		week = Math.ceil(date/7);
	} 
	$scope.date = milliseconds;
	$scope.currDay = day;

	// Labels badges when they are clicked
  	$scope.droplet = function(userbadge) {
  		var badgePopover = new Drop ({
  			target: document.querySelector(".a" + userbadge['$id']),
  			content: userbadge['$value'],
  			position: "bottom center",
  			openOn: 'click'
  		});
  	}


  	// Declaring variables needed for database
  	// Saving database variables to scope
	$scope.currentGoal = "0"
	$scope.Math = window.Math;
	console.log($scope.userId);
	var badgeRef = ref.child("allbadges");
	var userRef = ref.child("users");
	var userobjectsRef = userRef.child($scope.userId);
	var userGoalRef = userobjectsRef.child("goals");
	var goalRef = userGoalRef.child("goal");
	var userId = $scope.userId;
	var userobjectsRef = userRef.child(userId);
	var userGoalsRef = userobjectsRef.child("goals");
	$scope.goalsArray = $firebaseArray(userGoalsRef);
	var userbadgeRef = userobjectsRef.child("badges");
	var specificGoalRef = userGoalRef.child($scope.currentGoal);
  var currentGoalObj = $firebaseObject(specificGoalRef);
	var schedule = specificGoalRef.child("schedule");
  	var schedObj = $firebaseObject(schedule);
	var timeRef = specificGoalRef.child("totaltime");
	var logs = specificGoalRef.child("logs");
  var weekRef = logs.child(week);
  var dayRef = weekRef.child(day);
  var dayObj = $firebaseObject(dayRef);
  var logsObj = $firebaseObject(logs);
    
  dayObj.$bindTo($scope, "dayObj").then(function() {
    $scope.dayObj.$value;
    schedObj.$bindTo($scope, "schedObj").then(function(){
      var schedTime = $scope.schedObj[day].hours;
      var schedTimeMilli = schedTime * 3600000;

      // function that controls whether the daily goal is shown or hidden
      // depending on whether that goal has been met already or not
      $scope.showDailyGoal = function() {
        if($scope.dayObj.$value >= schedTimeMilli) {
          return false;
        } else {
          return true;
        }
      };
    });
  });
	
	// array of user's badges
	$scope.userbadges = $firebaseArray(userbadgeRef);
	// array of all possible badges
	$scope.allbadges = $firebaseArray(badgeRef);
	// array of user's goals
	$scope.userGoals = $firebaseArray(userGoalRef);
	// console.log($scope.userGoals);
	// array of all of user's logs
	$scope.goalArray = $firebaseArray(specificGoalRef);
	// console.log($scope.goalArray);
	// array of a specific log containing log details
	$scope.logArray = $firebaseArray(logs);
	// console.log($scope.logArray);
  // array of days of the week which contain the user's daily time goals 
  $scope.scheduleArray = $firebaseArray(schedule);
  // console.log($scope.scheduleArray);

  // START BAR CHART -----------------------------------------------------------------
  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 370 - margin.left - margin.right,
      height = 330 - margin.top - margin.bottom

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

  d3.tsv("../test_data/testdata.tsv", type, function(error, data) {
    console.log(data);
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
        .attr('x', -120)
        .style('text-anchor', 'end')
        .text('Hours');

    chart.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr('class', 'bar')
        .attr('x', function(d) { return x(d.days); })
        .attr('y', function(d) { return height; })
        .attr('height', function(d) { return 0; })
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
  // END OF THE BARCHART ---------------------------------------------------------------------


  // START HEATMAP -------------------------------------------------------------------------------
  var margin = { top: 20, right: 0, bottom: 50, left: 40 },
      heatWidth = 400 - margin.left - margin.right,
      heatHeight = 385 - margin.top - margin.bottom,
      gridSize = Math.floor(50),
      legendElementWidth = gridSize / 1.28,
      buckets = 9,
      colors = ["#ffffff","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
      days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
      weeks = ["1", "2", "3", "4", "5", "6"];
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
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "weeksLabel mono axis axis-workweek" : "weeksLabel mono axis"); });

  var dayLabels = svg.selectAll(".daysLabel")
      .data(days)
      .enter().append("text")
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return i * gridSize; })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "daysLabel mono axis axis-worktime" : "daysLabel mono axis"); });

        // code to try to add label to heatmap
      svg.append("text")
        .attr("class", "mono")
        .attr("x", -135)
        .attr("y", -20)
        .style("text-anchor", "end")
        .attr('transform', 'rotate(-90)')
        .text('weeks');

      svg.append("text")
        .attr("class", "mono")
        .text("range of hours")
        .attr("x", 130)
        .attr("y", 363);


  var heatmapChart = function(tsvFile) {
    d3.tsv("./test_data/hours1.tsv",
    function(d) {
      return {
        weeks: +d.weeks,
        days: +d.days,
        value: +d.value
      };
    },
    function(error, data) {

      // scale.quantile sets continuous domains to discrete ranges in buckets (or bins)
      var colorScale = d3.scale.quantile()
          .domain([0, buckets - 1,  function (d) { return d.value; }])
          .range(colors);

      var cards = svg.selectAll(".hour")
          .data(data, function(d) {return d.weeks+':'+d.days;})

      cards.enter().append("rect")
          .attr("x", function(d) { return (d.days) * gridSize; })
          .attr("y", function(d) { return (d.weeks - 1) * gridSize; })
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("class", "hour bordered")
          .attr("data-position", "top")
          .attr("width", gridSize)
          .attr("height", gridSize)
          .style("fill", colors[0]);


      cards.transition().duration(2000)
          .style("fill", function(d) { return colorScale(d.value); });

      cards.exit().remove();

      var legend = svg.selectAll(".legend")
          .data([0].concat(colorScale.quantiles()), function(d) { return d; });

      legend.enter().append("g")
          .attr("class", "legend");

      legend.append("rect")
        .attr("class", "bordered")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", heatHeight - 5)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[i]; });

      legend.append("text")
        .attr("class", "mono")
        .text(function(d, i) { return "≥ " + i; })
        .attr("x", function(d, i) { return legendElementWidth * i + 10; })
        .attr("y", heatHeight - 5 + gridSize / 1.3);

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
  //  END HEATMAP-------------------------------------------------------------------

  //Timer stuff --------------------------------------------------------------------
	
   /* // Create a firebaseObject of your users, and store this as part of $scope
    $scope.users = $firebaseObject(userRef);
  
    // Create authorization object that referes to firebase
    $scope.authObj = $firebaseAuth(ref);
  var authData = $scope.authObj.$getAuth();
    if (authData) {
        $scope.userId = authData.uid;
    } 
  console.log($scope.userId);
  var userObjectsRef = userRef.child($scope.userId);
  console.log(userObjectsRef);
  var userGoalsRef = userObjectsRef.child("goals");
  console.log(userGoalsRef);*/

  // $scope.timerRunning = false;
  // $scope.timerStopped = false;
  // $scope.timerDone = false;
  // $scope.started = true;
  // $scope.stopped = false;
  // $scope.restarted = false;
  // $scope.done = true;
  // $scope.reset = false;
  
    $scope.startTimer = function (){
        $scope.$broadcast('timer-start');
    };

    $scope.stopTimer = function (){
        $scope.$broadcast('timer-stop');
    };

    $scope.resumeTimer = function (){
        $scope.$broadcast('timer-resume');
    }

    $scope.resetTimer= function (){
        $scope.$broadcast('timer-reset');
    }

    $scope.showGoals = function() {
        $scope.showGoals = true;
    }

	var specificGoalRef = userGoalRef.child($scope.currentGoal);
	var totaltimeRef = specificGoalRef.child("totaltime")
	$scope.totaltime = $firebaseObject(totaltimeRef)
	console.log($scope.totaltime)

    $scope.doneTimer = function() {
  		var today = new Date();
  		var date = today.getDate();
  		var day = today.getDay();
  		var week = 0;
  		if (date == 31 || date == 30){
  		  if (day == 0 || day == 1){
  			  week = 6;
  		  }
  		} else{
  		  week = Math.ceil(date/7);
  		}
  		console.log(date);
  		console.log(day);
  		console.log(week);
		
		console.log($scope.totaltime);
  		var timeObj = $firebaseObject(timeRef);
  	    timeObj.$bindTo($scope, "totaltime").then(function() {
  			var totalTime = $scope.totaltime.$value;
			var addedTime = $scope.currentTime.millis;
			$scope.totaltime.$value = totalTime + addedTime;
  			console.log("total is " + $scope.totaltime.$value); 
  			console.log("added amount is " + $scope.currentTime.millis);
  			var logObj = $firebaseObject(logs);
  			logObj.$bindTo($scope, "logs").then(function(){
  				console.log($scope.logs);
  				console.log($scope.logs[week]);
  				$scope.logs[week][day] = $scope.logs[week][day] + addedTime;
  			});
  		});
    }
    $scope.$on('timer-stopped', function (event, args) {
      console.log('timer-stopped args = ', args);
		  $scope.currentTime = args;
    });

	//Timer stuff end---------------------------------------------------------------



}); // end of dashboard controller


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
		  var shouldGoDashboard = toState.name !== "newGoal" && toState.name !== "dashboard";
		  if(shouldGoDashboard){
			$state.go('dashboard')
			event.preventDefault();
		}
		  return;
	  }
      
    });
});

window.onload = function () {
	angular.element(".button-collapse").sideNav();
	console.log("hello");
}


