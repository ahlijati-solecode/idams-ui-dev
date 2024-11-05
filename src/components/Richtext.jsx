import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import PropTypes from 'prop-types';
import './Richtext.scss';

const Richtext = ({
  theme,
  value,
  onChange,
  modules,
  formats,
  disabled,
}) => (
  <div className="solecode-ui-richtext">
    <ReactQuill
      className={disabled ? 'quill-disabled' : ''}
      theme={theme}
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      readOnly={disabled}
    />
  </div>
);

Richtext.propTypes = {
  theme: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  modules: PropTypes.object,
  formats: PropTypes.array,
  disabled: PropTypes.bool,
};

Richtext.defaultProps = {
  theme: 'snow',
  value: null,
  onChange: () => {},
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link'],
    ],
  },
  formats: [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image',
  ],
  disabled: false,
};

export default Richtext;
