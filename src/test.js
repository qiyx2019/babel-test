const getName = (name) => {
  if(name){
    return name.toLowerCase();
  }
  return null;
}
const submit = () => {
  this.props.form.validateFields((err,value)=> {
    if(!err) {
      dispath({
        type:"home/login",
        payload:value
      })
    } else {
      message.error(err);
    }
  }) 
}