import { useCallback, useState } from 'react';

export function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((previous) => ({ ...previous, [name]: value }));
    // Clear a field's error as soon as the user edits it
    setErrors((previous) => (previous[name] ? { ...previous, [name]: undefined } : previous));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setErrors({});
    setFormError('');
    setSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      const fieldErrors = error.fieldErrors ?? {};
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors);
      else setFormError(error.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, formError, submitting, handleChange, handleSubmit };
}