function scrollToBottom() {
    window.scrollBy(0, document.body.scrollHeight - document.body.scrollTop);
};

function log(data){
  output_log.innerHTML += data + "<br />";
  /*document.body.appendChild(prettyPrint(evt));*/
  scrollToBottom();
}
