var usrbadges = [];
var myApp = angular.module('myApp', ['ui.router', 'firebase', 'angular-svg-round-progress', "ui.bootstrap"])
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
		$http.post('email.php', {
			data: 'toPost'
		}, {}).then(function(result) {
			first_name: first_name,
			last_name: last_name,
			email: email,
			textarea1: text
		});
		// $http("email.php", {
		// 	first_name: first_name,
		// 	last_name: last_name,
		// 	email: email,
		// 	textarea1: text
		// });
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

myApp.controller('DashboardController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject) {

  // ADDING BADGES
	var authData = $scope.authObj.$getAuth();
  if (authData) {
      $scope.userId = authData.uid;
  }
	var badgeRef = ref.child("allbadges");
	var userRef = ref.child("users");
	// var userId = $scope.userId; - maybe delete this since it can be put into userobjectsRef directly below
	// console.log(userId);
	var userobjectsRef = userRef.child($scope.userId);
  var userGoalRef = userobjectsRef.child("goals");
	var userbadgeRef = userobjectsRef.child("badges");
	$scope.userbadges = $firebaseArray(userbadgeRef)
	
	$scope.allbadges = $firebaseArray(badgeRef)
	// console.log("badges loaded");
	// console.log($scope.allbadges);
	// console.log($scope.userbadges);

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

  // $scope.curr = 55;

  // CREATE CALENDAR
  // var width = 960,
  //     height = 136,
  //     cellSize = 17; // cell size

  // var percent = d3.format(".1%"),
  //     format = d3.time.format("%Y-%m-%d");

  // var color = d3.scale.quantize()
  //     .domain([-.05, .05])
  //     .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

  // var svg = d3.select("#calendar").selectAll("svg")
  //     .data(d3.range(1990, 2011))
  //   .enter().append("svg")
  //     .attr("width", width)
  //     .attr("height", height)
  //     .attr("class", "RdYlGn")
  //   .append("g")
  //     .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

  // svg.append("text")
  //     .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
  //     .style("text-anchor", "middle")
  //     .text(function(d) { return d; });

  // var rect = svg.selectAll(".day")
  //     .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  //   .enter().append("rect")
  //     .attr("class", "day")
  //     .attr("width", cellSize)
  //     .attr("height", cellSize)
  //     .attr("x", function(d) { return d3.time.weekOfYear(d) * cellSize; })
  //     .attr("y", function(d) { return d.getDay() * cellSize; })
  //     .datum(format);

  // rect.append("title")
  //     .text(function(d) { return d; });

  // svg.selectAll(".month")
  //     .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  //   .enter().append("path")
  //     .attr("class", "month")
  //     .attr("d", monthPath);

  // d3.csv("../test_data/dji.csv", function(error, csv) {
  //   if (error) throw error;

  //   var data = d3.nest()
  //     .key(function(d) { return d.Date; })
  //     .rollup(function(d) { return (d[0].Close - d[0].Open) / d[0].Open; })
  //     .map(csv);

  //   rect.filter(function(d) { return d in data; })
  //       .attr("class", function(d) { return "day " + color(data[d]); })
  //     .select("title")
  //       .text(function(d) { return d + ": " + percent(data[d]); });
  // });

  // function monthPath(t0) {
  //   var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
  //       d0 = t0.getDay(), w0 = d3.time.weekOfYear(t0),
  //       d1 = t1.getDay(), w1 = d3.time.weekOfYear(t1);
  //   return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
  //       + "H" + w0 * cellSize + "V" + 7 * cellSize
  //       + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
  //       + "H" + (w1 + 1) * cellSize + "V" + 0
  //       + "H" + (w0 + 1) * cellSize + "Z";
  // }

  // d3.select(self.frameElement).style("height", "2910px");
	// $scope.getStyle = function(){
	//     var transform = ($scope.isSemi ? '' : 'translateY(-50%) ') + 'translateX(-50%)';

	//     return {
	//         'top': $scope.isSemi ? 'auto' : '50%',
	//         'bottom': $scope.isSemi ? '5%' : 'auto',
	//         'left': '50%',
	//         'transform': transform,
	//         '-moz-transform': transform,
	//         '-webkit-transform': transform,
	//         'font-size': $scope.radius/3.5 + 'px'
	//     };
	// };


  // START HEATMAP
  // var margin = { top: 50, right: 0, bottom: 100, left: 30 },
  //           width = 960 - margin.left - margin.right,
  //           height = 430 - margin.top - margin.bottom,
  //           gridSize = Math.floor(width / 24),
  //           legendElementWidth = gridSize*2,
  //           buckets = 9,
  //           colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
  //           days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  //           times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];
  //           datasets = ["data.tsv"];

  //       var svg = d3.select("#heatmap").append("svg")
  //           .attr("width", width + margin.left + margin.right)
  //           .attr("height", height + margin.top + margin.bottom)
  //         .append("g")
  //           .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //       var dayLabels = svg.selectAll(".dayLabel")
  //           .data(days)
  //           .enter().append("text")
  //             .text(function (d) { return d; })
  //             .attr("x", 0)
  //             .attr("y", function (d, i) { return i * gridSize; })
  //             .style("text-anchor", "end")
  //             .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
  //             .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

  //       var timeLabels = svg.selectAll(".timeLabel")
  //           .data(times)
  //           .enter().append("text")
  //             .text(function(d) { return d; })
  //             .attr("x", function(d, i) { return i * gridSize; })
  //             .attr("y", 0)
  //             .style("text-anchor", "middle")
  //             .attr("transform", "translate(" + gridSize / 2 + ", -6)")
  //             .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

  //       var heatmapChart = function(tsvFile) {
  //         d3.tsv(tsvFile,
  //         function(d) {
  //           return {
  //             day: +d.day,
  //             hour: +d.hour,
  //             value: +d.value
  //           };
  //         },
  //         function(error, data) {
  //           var colorScale = d3.scale.quantile()
  //               .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
  //               .range(colors);

  //           var cards = svg.selectAll(".hour")
  //               .data(data, function(d) {return d.day+':'+d.hour;});

  //           cards.append("title");

  //           cards.enter().append("rect")
  //               .attr("x", function(d) { return (d.hour - 1) * gridSize; })
  //               .attr("y", function(d) { return (d.day - 1) * gridSize; })
  //               .attr("rx", 4)
  //               .attr("ry", 4)
  //               .attr("class", "hour bordered")
  //               .attr("width", gridSize)
  //               .attr("height", gridSize)
  //               .style("fill", colors[0]);

  //           cards.transition().duration(1000)
  //               .style("fill", function(d) { return colorScale(d.value); });

  //           cards.select("title").text(function(d) { return d.value; });
            
  //           cards.exit().remove();

  //           var legend = svg.selectAll(".legend")
  //               .data([0].concat(colorScale.quantiles()), function(d) { return d; });

  //           legend.enter().append("g")
  //               .attr("class", "legend");

  //           legend.append("rect")
  //             .attr("x", function(d, i) { return legendElementWidth * i; })
  //             .attr("y", height)
  //             .attr("width", legendElementWidth)
  //             .attr("height", gridSize / 2)
  //             .style("fill", function(d, i) { return colors[i]; });

  //           legend.append("text")
  //             .attr("class", "mono")
  //             .text(function(d) { return "≥ " + Math.round(d); })
  //             .attr("x", function(d, i) { return legendElementWidth * i; })
  //             .attr("y", height + gridSize);

  //           legend.exit().remove();

  //         });  
  //       };

  //       heatmapChart(datasets[0]);
        
  //       var datasetpicker = d3.select("#dataset-picker").selectAll(".dataset-button")
  //         .data(datasets);

  //       datasetpicker.enter()
  //         .append("input")
  //         .attr("value", function(d){ return "Dataset " + d })
  //         .attr("type", "button")
  //         .attr("class", "dataset-button")
  //         .on("click", function(d) {
  //           heatmapChart(d);
  //         });
  //  END HEATMAP
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


