function question(visible, q, answear){
    var visible;
    var requirements;
    var formElemList;
    var q;
    var answear;

    this.visible=visible;
    requirements = null;
    this.q = q;
    this.answear = answear;
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
