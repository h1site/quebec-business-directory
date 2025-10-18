import PropTypes from 'prop-types';

const AnimatedCheckbox = ({ id, checked, onChange, label, className = '' }) => {
  return (
    <label htmlFor={id} className={`checkbox-item ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
      />
      <span>{label}</span>
    </label>
  );
};

AnimatedCheckbox.propTypes = {
  id: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default AnimatedCheckbox;
