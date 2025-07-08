/**
 * Modal Management Hook
 * Custom hook for modal state management
 */

import { useStore } from '@tanstack/react-store';
import React, { useState, useCallback } from 'react';

import { appActions } from '@/store';
import { appStore } from '@/store/app-store';
import type { ModalState } from '@/types';

/**
 * Modal configuration options
 */
interface UseModalOptions {
  onOpen?: () => void;
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

/**
 * Local modal hook for component-specific modals
 */
export const useModal = (options: UseModalOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState<string | undefined>();
  const [content, setContent] = useState<React.ReactNode | undefined>();

  const open = useCallback(
    (modalContent?: { title?: string; content?: React.ReactNode }) => {
      if (modalContent?.title) setTitle(modalContent.title);
      if (modalContent?.content) setContent(modalContent.content);
      setIsOpen(true);
      options.onOpen?.();
    },
    [options]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    options.onClose?.();
  }, [options]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    title,
    content,
    open,
    close,
    toggle,
    setTitle,
    setContent,
  };
};

/**
 * Global modal hook using the app store
 */
export const useGlobalModal = () => {
  const modalState = useStore(appStore, state => state.modal);

  const openModal = useCallback((modal: Omit<ModalState, 'isOpen'>) => {
    appActions.openModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    appActions.closeModal();
  }, []);

  return {
    ...modalState,
    openModal,
    closeModal,
  };
};

/**
 * Confirmation modal hook
 */
interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export const useConfirmationModal = () => {
  const { openModal, closeModal } = useGlobalModal();

  const confirm = useCallback(
    (options: ConfirmationOptions) => {
      const {
        title = 'Confirm Action',
        message,
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        variant = 'info',
        onConfirm,
        onCancel,
      } = options;

      const handleConfirm = async () => {
        try {
          await onConfirm();
          closeModal();
        } catch {
          // Keep modal open on error
          // Confirmation action failed, keep modal open
        }
      };

      const handleCancel = () => {
        onCancel?.();
        closeModal();
      };

      openModal({
        title,
        content: React.createElement('div', { className: 'space-y-4' }, [
          React.createElement(
            'p',
            { key: 'message', className: 'text-gray-700' },
            message
          ),
          React.createElement(
            'div',
            { key: 'buttons', className: 'flex justify-end space-x-2' },
            [
              React.createElement(
                'button',
                {
                  key: 'cancel',
                  type: 'button',
                  onClick: handleCancel,
                  className:
                    'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                },
                cancelText
              ),
              React.createElement(
                'button',
                {
                  key: 'confirm',
                  type: 'button',
                  onClick: handleConfirm,
                  className: `px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    variant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : variant === 'warning'
                        ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`,
                },
                confirmText
              ),
            ]
          ),
        ]),
        onClose: handleCancel,
      });
    },
    [openModal, closeModal]
  );

  return { confirm };
};

/**
 * Form modal hook
 */
interface FormModalOptions<T> {
  title: string;
  initialData?: T;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  children: (props: {
    data: T | undefined;
    onSubmit: (data: T) => void;
    onCancel: () => void;
  }) => React.ReactNode;
}

export const useFormModal = <T>() => {
  const { openModal, closeModal } = useGlobalModal();

  const openFormModal = useCallback(
    (options: FormModalOptions<T>) => {
      const { title, initialData, onSubmit, onCancel, children } = options;

      const handleSubmit = async (data: T) => {
        try {
          await onSubmit(data);
          closeModal();
        } catch {
          // Keep modal open on error
          // Form submission failed, keep modal open
        }
      };

      const handleCancel = () => {
        onCancel?.();
        closeModal();
      };

      openModal({
        title,
        content: children({
          data: initialData,
          onSubmit: handleSubmit,
          onCancel: handleCancel,
        }),
        onClose: handleCancel,
      });
    },
    [openModal, closeModal]
  );

  return { openFormModal };
};

/**
 * Multi-step modal hook
 */
interface Step {
  title: string;
  content: React.ReactNode;
  canProceed?: boolean;
}

interface MultiStepModalOptions {
  steps: Step[];
  onComplete: () => void;
  onCancel?: () => void;
}

export const useMultiStepModal = () => {
  const { openModal, closeModal } = useGlobalModal();
  const [currentStep, setCurrentStep] = useState(0);

  const openMultiStepModal = useCallback(
    (options: MultiStepModalOptions) => {
      const { steps, onComplete, onCancel } = options;
      setCurrentStep(0);

      const handleNext = () => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          onComplete();
          closeModal();
        }
      };

      const handlePrevious = () => {
        if (currentStep > 0) {
          setCurrentStep(prev => prev - 1);
        }
      };

      const handleCancel = () => {
        setCurrentStep(0);
        onCancel?.();
        closeModal();
      };

      const currentStepData = steps[currentStep];

      openModal({
        title: currentStepData.title,
        content: React.createElement('div', { className: 'space-y-4' }, [
          // Step indicator
          React.createElement(
            'div',
            {
              key: 'indicator',
              className: 'flex items-center justify-between',
            },
            [
              React.createElement(
                'div',
                { key: 'steps', className: 'flex space-x-2' },
                steps.map((_, index) =>
                  React.createElement('div', {
                    key: index,
                    className: `w-3 h-3 rounded-full ${
                      index === currentStep
                        ? 'bg-blue-600'
                        : index < currentStep
                          ? 'bg-green-600'
                          : 'bg-gray-300'
                    }`,
                  })
                )
              ),
              React.createElement(
                'span',
                { key: 'counter', className: 'text-sm text-gray-500' },
                `Step ${currentStep + 1} of ${steps.length}`
              ),
            ]
          ),
          // Step content
          React.createElement(
            'div',
            { key: 'content' },
            currentStepData.content
          ),
          // Navigation buttons
          React.createElement(
            'div',
            { key: 'navigation', className: 'flex justify-between' },
            [
              React.createElement(
                'button',
                {
                  key: 'cancel',
                  type: 'button',
                  onClick: handleCancel,
                  className:
                    'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50',
                },
                'Cancel'
              ),
              React.createElement(
                'div',
                { key: 'nav-buttons', className: 'space-x-2' },
                [
                  ...(currentStep > 0
                    ? [
                        React.createElement(
                          'button',
                          {
                            key: 'previous',
                            type: 'button',
                            onClick: handlePrevious,
                            className:
                              'px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50',
                          },
                          'Previous'
                        ),
                      ]
                    : []),
                  React.createElement(
                    'button',
                    {
                      key: 'next',
                      type: 'button',
                      onClick: handleNext,
                      disabled: currentStepData.canProceed === false,
                      className:
                        'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
                    },
                    currentStep === steps.length - 1 ? 'Complete' : 'Next'
                  ),
                ]
              ),
            ]
          ),
        ]),
        onClose: handleCancel,
      });
    },
    [openModal, closeModal, currentStep]
  );

  return { openMultiStepModal };
};
