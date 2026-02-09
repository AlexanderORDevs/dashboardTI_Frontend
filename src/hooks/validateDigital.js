function ValidateMethods() {
  function fullName(value, name) {
    const nameRuler = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,32}$/;
    return {
      message: 'Must contain only letters and spaces, max 32 characters',
      isPass: nameRuler.test(value),
    };
  }

  function position(value, name) {
    const nameRuler = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s&.,()'-]+$/;
    return {
      message:
        "Must contain only letters, numbers and common punctuation (e.g. & - . , ( ) ')",
      isPass: nameRuler.test(value),
    };
  }

  function isEmail(value) {
    const emailRule =
      /^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
    return {
      message: `Looks like this is not an email.`,
      isPass: new RegExp(emailRule).test(value),
    };
  }

  function isNotEmpty(value, name) {
    return {
      message: `${name} cannot be empty.`,
      isPass: value !== '',
    };
  }

  return {
    isEmail,
    isNotEmpty,
    fullName,
    position,
  };
}

function validateForm(value, checkList, name) {
  const validateMethods = new ValidateMethods();
  let result = {
    isPass: true,
    message: '',
  };
  let errorIndex;
  // * if all pass return !true else !false
  let isAllPass = checkList.every((eachMethod, index) => {
    const status = validateMethods[eachMethod](value, name);
    if (!status.isPass) {
      errorIndex = index;
      return false;
    }
    return true;
  });

  if (!isAllPass) {
    const status = validateMethods[checkList[errorIndex]](value, name);
    result = {
      isPass: status.isPass,
      message: status.message,
    };
  }
  return result;
}

export { validateForm };
