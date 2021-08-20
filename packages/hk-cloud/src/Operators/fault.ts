export const rejectWithFault = (uow, ignore = false) => (err) => {
    /* istanbul ignore else */
    if (!ignore) {
      // adorn the troubled uow
      // for processing in the errors handler
      err.uow = uow;
    }
    return Promise.reject(err);
  }