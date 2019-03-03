import { useReducer } from "react";
import isEmpty from "lodash/isEmpty";

// Actions types
const SET_FORM_FIELD = "SET_FORM_FIELD";
const SET_FORM_ERRORS = "SET_FORM_ERRORS";
const SET_FORM_SUBMITTING = "SET_FORM_SUBMITTING";
const SET_SUBMIT_COUNT = "SET_SUBMIT_COUNT";
const SET_VALIDATING = "SET_VALIDATING";
const SET_RESET_FORM = "SET_RESET_FORM";

/**
 * setFieldValue
 * Action creator to set form field
 * @param {string} name
 * @param {any} value
 */
const setFieldValue = (name, value) => {
  return {
    type: SET_FORM_FIELD,
    field: name,
    value
  };
};

/**
 * setIsValidating
 * Action creator to setting isValidating
 * @param {boolean} isValidating
 */
const setIsValidating = isValidating => {
  return {
    type: SET_VALIDATING,
    isValidating
  };
};
/**
 * setResetForm
 * Reset form to initial value
 */
const setResetForm = () => {
  return {
    type: SET_RESET_FORM
  };
};
/**
 * setIsSubmitting
 * Set the value of the form when submitting
 * @param {boolean} isSubmitting
 */
const setIsSubmitting = isSubmitting => {
  return {
    type: SET_FORM_SUBMITTING,
    isSubmitting
  };
};
/**
 * setSubmitCount
 * Set the number of time form is submitted
 * @param {boolean} isSubmitting
 */
const setSubmitCount = submitCount => {
  return {
    type: SET_SUBMIT_COUNT,
    submitCount: submitCount + 1
  };
};
/**
 * setValidation
 * Validate values with validator function
 * @param {function} dispatch
 * @param {function} validator
 */
const setValidation = (dispatch, validator) => async values => {
  dispatch(setIsValidating(true));
  dispatch({
    type: SET_FORM_ERRORS,
    errors: (await validator(values)) || {}
  });
  dispatch(setIsValidating(false));
};

const initialState = {
  values: {},
  isValidating: false,
  isSubmitting: false,
  submitCount: 0,
  errors: {}
};
/**
 * formReducer
 * Reducer function for form
 * @param {object} state
 * @param {object} action
 */
function formReducer(state, action) {
  switch (action.type) {
    case SET_FORM_FIELD:
      return {
        ...state,
        values: {
          ...state.values,
          [action.field]: action.value
        }
      };
    case SET_FORM_ERRORS:
      return {
        ...state,
        errors: action.errors
      };
    case SET_SUBMIT_COUNT:
      return {
        ...state,
        submitCount: action.submitCount
      };
    case SET_FORM_SUBMITTING:
      return {
        ...state,
        isSubmitting: action.isSubmitting
      };
    case SET_VALIDATING:
      return {
        ...state,
        isValidating: action.isValidating
      };
    case SET_RESET_FORM:
      return initialState;
    default:
      return state;
  }
}
/**
 * useFormHooks
 * Hooks for form
 * @param {object} initalValues
 * @param {function} validator
 */
export function useFormHooks(initalValues = {}, validator = () => {}) {
  initialState.values = initalValues;
  const [state, dispatch] = useReducer(formReducer, initialState);
  const formMethods = {};

  const setField = async (name, value) => {
    const currentValues = { ...state.values };
    currentValues[name] = value;

    dispatch(setFieldValue(name, value));
    await setValidation(dispatch, validator)(currentValues);
  };

  formMethods.setField = setField;

  formMethods.onChange = e => {
    const { name, value } = e.target;
    setField(name, value);
  };

  formMethods.onSubmit = submitForm => async e => {
    e.preventDefault();
    const { values, errors, ...props } = state;
    setValidation(dispatch, validator)(state.values);
    dispatch(setSubmitCount(props.submitCount));

    if (isEmpty(errors) && !props.isValidating) {
      setIsSubmitting(true);
      await submitForm(values, props);
      setIsSubmitting(false);
    }
  };

  formMethods.reset = () => {
    dispatch(setResetForm(initialState));
  };

  return [state, formMethods];
}
