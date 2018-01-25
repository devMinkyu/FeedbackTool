
function trainingFeedBack(){
    $('#exam').empty();
    $("#exam").append($('#pdfTrainingView').html());
}
function downloadFiles(filepath) {
    var path = filepath;
    if(confirm("파일이 다운로드 됩니다.") == true) {
        location.href = "/feedbacks/download/" + path;
    }
  }