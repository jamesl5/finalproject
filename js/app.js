var usrbadges = [];
var myApp = angular.module('myApp', ['ui.router', 'firebase', 'angular-svg-round-progress'])

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

myApp.controller('HomeController', function($scope, $firebaseAuth, $firebaseArray, $firebaseObject, $http){
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
	var ref = new Firebase("https://info343final.firebaseio.com/");
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
		console.log("signin up");
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
		$scope.badges = []
    }
});


myApp.controller('DashboardController', function($scope) {

});





