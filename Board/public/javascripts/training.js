var feedbackProblem =["교수님설계안에 제시한 대상에 대해 강화적 피드백을 제공해보세요.", "교수님설계안에 제시한 대상에 대해 제안적 피드백을 제공해보세요.", "교수님설계안에 제시한 대상에 대해 교정적 피드백을 제공해보세요."];
var trainingExample = document.getElementById("trainingExample").innerHTML;

function trainingFeedBack(){
    $('.exam').remove();
    $('.main-sample').removeClass('hidden');
    if(trainingExample){
        $(".main-sample").append($('#pdfTrainingViewExam').html());  
        $(".ex1").append(trainingExample);  
    }
}
function submitSolution() {
    var solution1 = $('#tab-1').val();
    if(solution1 == '') {
        alert("답을 입력해주세요.");
        return;
    } else {
        alert("답을 제출했습니다.");
        $('#solutionAction').submit();
    }
}
function currentButton1(){
    $(".ex1").empty();  
    $(".ex1").append(feedbackProblem[0]);  
    $('ul.tabs li').removeClass('current');
    $('.form-control').removeClass('current');

    $("#tab1").addClass('current');
    $("#tab_1").addClass('current');
}
function currentButton2(){
    $(".ex1").empty();  
    $(".ex1").append(feedbackProblem[1]);  
    $('ul.tabs li').removeClass('current');
    $('.form-control').removeClass('current');

    $("#tab2").addClass('current');
    $("#tab_2").addClass('current');
}
function currentButton3(){
    $(".ex1").empty();  
    $(".ex1").append(feedbackProblem[2]);  
    $('ul.tabs li').removeClass('current');
    $('.form-control').removeClass('current');

    $("#tab3").addClass('current');
    $("#tab_3").addClass('current');
}