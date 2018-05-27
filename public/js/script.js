angular.module("Atm", ["ngRoute"]).config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/screen1', {
        templateUrl: 'view/screen1.html',
        controller: 'screen1Controller'
    }).when('/screen2', {
        templateUrl: 'view/screen2.html',
        controller: 'screen1Controller'
    }).when('/screen3', {
        templateUrl: 'view/screen3.html',
        controller: 'screen1Controller'
    }).
    otherwise({
        redirectTo: '/screen1'
    });
}]).
run(function($rootScope, $http) {

});
