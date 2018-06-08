var testData = [{entryName:"aaa",entryCount:23},
    {entryName:"bbb",entryCount:34},
    {entryName:"ccc",entryCount:45},
    {entryName:"ddd",entryCount:56},
    {entryName:"eee",entryCount:67},
    {entryName:"fff",entryCount:78},
    {entryName:"ggg",entryCount:76},
    {entryName:"hhh",entryCount:65},
    {entryName:"iii",entryCount:54},
    {entryName:"jjj",entryCount:43},
    {entryName:"kkk",entryCount:32},
    {entryName:"lll",entryCount:21}];
$(".datetimepicker").datetimepicker({
  format: 'yyyy-mm-dd',
  language: 'zh_CN',
  autoclose: true,
  todayHighlight: true,
  minuteStep: 3,
  minView: 2,
  orientation: 'bottom auto'
});
var app = angular.module('myApp',[])
app.controller("myCtrl", function ($scope){
    var startTime = $scope.startTime;
    var endTime = $scope.endTime;
    var etheme = $scope.theme;
    var myChart_pie = echarts.init(document.getElementById("main_pie"),etheme);
    var myChart_bar = echarts.init(document.getElementById("main_bar"),etheme);
    var option_pie = [];
    var option_bar = [];

    $scope.startTimeChange=function(){
        startTime = $scope.startTime;
        console.log($scope.startTime);
    };
    $scope.endTimeChange=function(){
        endTime = $scope.endTime;
        console.log($scope.endTime);
    };
    $scope.themeChange=function(){
        etheme = $scope.theme;

        echarts.dispose(myChart_bar);
        myChart_bar = echarts.init(document.getElementById("main_bar"),etheme);
        myChart_bar.setOption(option_bar);

        echarts.dispose(myChart_pie);
        myChart_pie = echarts.init(document.getElementById("main_pie"),etheme);
        myChart_pie.setOption(option_pie);
    };

    $scope.search=function(){
        var query = [];
        if (startTime != '' && startTime != null) {
          query.push({
            name: 'startTime',
            op: 'eq',
            stringValue: startTime
          });
        }
        if (endTime != '' && endTime != null) {
          query.push({
            name: 'endTime',
            op: 'eq',
            stringValue: endTime
          });
        }
        query = JSON.stringify(query);
        etheme = $scope.theme;
        $scope.initEcharts_pie(testData);
        $scope.initEcharts_bar(testData);

        echarts.dispose(myChart_bar);
        myChart_bar = echarts.init(document.getElementById("main_bar"),etheme);
        myChart_bar.setOption(option_bar);

        echarts.dispose(myChart_pie);
        myChart_pie = echarts.init(document.getElementById("main_pie"),etheme);
        myChart_pie.setOption(option_pie);
    };

    $scope.reset=function(){
        $scope.startTime.value('text', "");
        $scope.endTime.value('text', "");
        $scope.theme.value('value', "dark");
    };

    $scope.initEcharts = function(){
        var echartsData = $scope.conversionData(data);
        option = {
            title : {
                text: '各流程使用量统计',
                x:'center',
                textStyle: {
                    color:'#ccc',
                    fontSize :28
                }
            },
            grid: [
                {
                    top: 50,
                    width: '50%',
                    bottom: '45%',
                    left: 10,
                    containLabel: true
                }, {
                    top: '55%',
                    width: '50%',
                    bottom: 0,
                    left: 10,
                    containLabel: true
                }
            ],
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            toolbox : {
                show : true,
                saveAsImage : {
                    show : true   
                },
                restore : {
                    show : true
                }
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                left: 10,
                itemGap: 5,
                data: echartsData.ldata,
                inactiveColor: '#ccc', 
                selected: echartsData.selected
            },
        }
    }

    $scope.initEcharts_pie = function(data){
        var echartsData = $scope.conversionData(data);
        option_pie = {
            title : {
                text: '各流程使用量统计',
                x:'center',
                textStyle: {
                    color:'#ccc',
                    fontSize :28
                }
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            toolbox : {
                show : true,
                saveAsImage : {
                    show : true   
                },
                restore : {
                    show : true
                }
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                left: 10,
                itemGap: 5,
                data: echartsData.ldata,
                inactiveColor: '#ccc', 
                selected: echartsData.selected
            },
            series : [
                {
                    name: '流程使用量',
                    type: 'pie',
                    radius : '50%',
                    center: ['50%', '60%'],
                    itemStyle: {
                        normal : {
                            label : {
                                formatter : "{b} : {c} ({d}%)"
                            }
                        },
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    markArea :{
                        animationType : 'scale',
                        animationEasing : 'elasticOut'
                    },
                    data: echartsData.sdata
                }
            ]
        };
        return option_pie;
    };

    $scope.initEcharts_bar = function(data){
        var echartsData = $scope.conversionData(data);
        // 指定图表的配置项和数据
        option_bar = {
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            toolbox : {
                feature: {
                    magicType: {
                        type: ['stack', 'tiled']
                    },
                    dataView: {},
                    saveAsImage: {
                        pixelRatio: 2
                    }
                }
            },
            legend: {
                data: echartsData.ldata,
                align: 'left'
            },
            xAxis: {
                data: echartsData.ldata,
                silent: false,
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value'
            },
            series : [
                {
                    type: 'bar',
                    name: echartsData.lData,
                    data: echartsData.vdata
                }
            ]
        };
        return option_bar;
    };

    $scope.conversionData = function(data){
        var seriesData = [];
        var legendData = [];
        var valueData = [];
        var selected = {};
        for (var i = 0; i < data.length; i++) {
            var entryName = data[i].entryName;
            var entryCount = data[i].entryCount;
            legendData.push(entryName);
            valueData.push(entryCount);
            seriesData.push({
              name: entryName,
              value: entryCount
            });
            selected[entryName] = entryCount > 10;
        }
        return {
        ldata: legendData,
        sdata: seriesData,
        vdata: valueData,
        selected: selected
        };
    }
});