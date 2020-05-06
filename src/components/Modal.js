import React from 'react';
import styled from 'styled-components';
import { Dialog } from '@reach/dialog';
import VisuallyHidden from '@reach/visually-hidden';
import { Icon } from 'react-icons-kit';
import { x as xIcon } from 'react-icons-kit/feather/x';

import '@reach/dialog/styles.css';
import UnstyledButton from './UnstyledButton';

const Modal = ({ isOpen, onClose, children, ...delegated }) => {
  return (
    <>
      <Wrapper isOpen={isOpen} onDismiss={onClose} {...delegated}>
        <CloseButton onClick={onClose}>
          <VisuallyHidden>Close</VisuallyHidden>
          <span aria-hidden>
            <Icon icon={xIcon} size={24} />
          </span>
        </CloseButton>
        {children}
      </Wrapper>
    </>
  );
};

const CloseButton = styled(UnstyledButton)`
  position: absolute;
  top: 0;
  right: 0;
  width: 48px;
  height: 48px;
  transform: translateY(calc(-100% - 16px));
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled(Dialog)`
  &[data-reach-dialog-content] {
    position: relative;
    color: black;
  }
`;

export default Modal;
