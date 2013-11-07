function question(){
    var visible;
    var requirements;
    var formelemList;
    var question;
    var answear;
}

function checkRequirements(question){
    return question.requirements;
}

function addRequirements(question, requirement){
    question.requirements.push(requirement);
}

function showQuestion(question){
    document.write(question);
    document.write(answear);
}
