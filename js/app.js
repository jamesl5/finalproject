var usrbadges = [];
var myApp = angular.module('myApp', ['ui.router', 'firebase', 'angular-svg-round-progress'])
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
});

myApp.controller('HomeController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http, $location){
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
	console.log("hello");
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
});



myApp.controller('DashboardController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject) {
	
	var authData = $scope.authObj.$getAuth();
    if (authData) {
        $scope.userId = authData.uid;
    }
	var badgeRef = ref.child("allbadges");
	var userRef = ref.child("users");
	var userId = $scope.userId;
	console.log(userId);
	var userobjectsRef = userRef.child(userId);
	var userbadgeRef = userobjectsRef.child("badges");
	$scope.userbadges = $firebaseArray(userbadgeRef)
	
	$scope.allbadges = $firebaseArray(badgeRef)
	console.log("badges loaded");
	console.log($scope.allbadges);
	console.log($scope.userbadges);

  //CREATES THE BAR CHARt
  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 370 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom; //these are random values - no math was done to figure them out

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

  var chart = d3.select("#barChart")
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
        .attr('y', function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })


    // bar.append("text")
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


