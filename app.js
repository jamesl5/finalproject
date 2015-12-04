var myApp = angular.module('myApp', ['ui.router', 'angular-progress-arc']);

myApp.config(function($stateProvider) {
	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: 'templates/home.html',
			controller: 'HomeController'
		})
		.state('one', {
			url: '/one',
			templateUrl: 'templates/one.html',
			controller: 'OneController'
		})
		.state('two', {
			url: '/two',
			templateUrl: 'templates/two.html',
			controller: 'TwoController'
		})
		.state('three', {
			url: '/three',
			templateUrl: 'templates/three.html',
			controller: 'ThreeController'
		});

});

myApp.controller('HomeController', function($scope) {

});

myApp.controller('OneController', function($scope) {

});

myApp.controller('TwoController', function($scope) {
});

myApp.controller('ThreeController', function($scope) {
});




