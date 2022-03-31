const getName = name => {
  return name.toLowerCase();
};

const submit = () => {
  this.props.form.validateFields().then(value => {
    track(this.props)
    dispath({
      type: "home/login",
      payload: value
    });
  }).catch(err => {
    message.error(err);
  });
};