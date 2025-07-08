/**
 * Component Showcase
 * Demonstrates usage of all reusable UI components
 */

import { useForm } from '@tanstack/react-form';
import React, { useState } from 'react';

import {
  Button,
  IconButton,
  ButtonGroup,
  Modal,
  ConfirmationModal,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardDescription,
  Badge,
  StatusBadge,
  PriorityBadge,
  CountBadge,
  RoleBadge,
  PermissionBadge,
  TagBadge,
  BadgeGroup,
  Alert,
  InlineAlert,
  Form,
  FormSection,
  FormField,
  FormActions,
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormCheckboxGroup,
  FormSubmitButton,
  FormCard,
  FormErrorSummary,
  LoadingSpinner,
  LoadingButton,
  SkeletonCard,
} from '@/components/ui';

export const ComponentShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState(['React', 'TypeScript']);

  // Example form
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      description: '',
      category: '',
      isActive: false,
      priority: '',
      tags: [] as string[],
    },
    onSubmit: async ({ value: _value }) => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsLoading(false);
      // Form submitted successfully
    },
  });

  const handleLoadingDemo = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(tags => tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-8'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          UI Component Showcase
        </h1>
        <p className='text-lg text-gray-600'>
          Demonstration of all reusable UI components
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and states</CardDescription>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            <ButtonGroup>
              <Button variant='primary'>Primary</Button>
              <Button variant='secondary'>Secondary</Button>
              <Button variant='success'>Success</Button>
              <Button variant='danger'>Danger</Button>
              <Button variant='warning'>Warning</Button>
              <Button variant='info'>Info</Button>
              <Button variant='ghost'>Ghost</Button>
              <Button variant='link'>Link</Button>
            </ButtonGroup>

            <ButtonGroup>
              <Button size='xs'>Extra Small</Button>
              <Button size='sm'>Small</Button>
              <Button size='md'>Medium</Button>
              <Button size='lg'>Large</Button>
              <Button size='xl'>Extra Large</Button>
            </ButtonGroup>

            <ButtonGroup>
              <LoadingButton isLoading={isLoading} onClick={handleLoadingDemo}>
                {isLoading ? 'Loading...' : 'Start Loading'}
              </LoadingButton>
              <IconButton
                icon={<span>⚙️</span>}
                aria-label='Settings'
                onClick={() => {
                  /* Settings clicked */
                }}
              />
            </ButtonGroup>
          </div>
        </CardBody>
      </Card>

      {/* Form Components Section */}
      <FormCard
        title='Form Components'
        description='Interactive form with validation'
      >
        <Form
          onSubmit={e => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FormErrorSummary form={form} />

          <FormSection title='Basic Information'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField>
                <form.Field name='name'>
                  {field => (
                    <FormInput
                      field={field}
                      label='Name'
                      placeholder='Enter your name'
                      required
                    />
                  )}
                </form.Field>
              </FormField>

              <FormField>
                <form.Field name='email'>
                  {field => (
                    <FormInput
                      field={field}
                      type='email'
                      label='Email'
                      placeholder='Enter your email'
                      required
                    />
                  )}
                </form.Field>
              </FormField>
            </div>

            <FormField>
              <form.Field name='description'>
                {field => (
                  <FormTextarea
                    field={field}
                    label='Description'
                    placeholder='Enter description'
                    rows={4}
                  />
                )}
              </form.Field>
            </FormField>

            <FormField>
              <form.Field name='category'>
                {field => (
                  <FormSelect
                    field={field}
                    label='Category'
                    placeholder='Select a category'
                    options={[
                      { value: 'tech', label: 'Technology' },
                      { value: 'design', label: 'Design' },
                      { value: 'business', label: 'Business' },
                    ]}
                  />
                )}
              </form.Field>
            </FormField>
          </FormSection>

          <FormSection title='Preferences'>
            <FormField>
              <form.Field name='isActive'>
                {field => (
                  <FormCheckbox
                    field={field}
                    label='Active'
                    description='Enable this option to activate the feature'
                  />
                )}
              </form.Field>
            </FormField>

            <FormField>
              <form.Field name='priority'>
                {field => (
                  <FormRadioGroup
                    field={field}
                    label='Priority'
                    name='priority'
                    options={[
                      { value: 'low', label: 'Low', description: 'Not urgent' },
                      {
                        value: 'medium',
                        label: 'Medium',
                        description: 'Moderate priority',
                      },
                      { value: 'high', label: 'High', description: 'Urgent' },
                    ]}
                  />
                )}
              </form.Field>
            </FormField>

            <FormField>
              <form.Field name='tags'>
                {field => (
                  <FormCheckboxGroup
                    field={field}
                    label='Tags'
                    options={[
                      { value: 'react', label: 'React' },
                      { value: 'typescript', label: 'TypeScript' },
                      { value: 'tailwind', label: 'Tailwind CSS' },
                      { value: 'vite', label: 'Vite' },
                    ]}
                    orientation='horizontal'
                  />
                )}
              </form.Field>
            </FormField>
          </FormSection>

          <FormActions>
            <Button variant='secondary' type='button'>
              Cancel
            </Button>
            <FormSubmitButton form={form} variant='primary'>
              Submit Form
            </FormSubmitButton>
          </FormActions>
        </Form>
      </FormCard>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            <BadgeGroup>
              <Badge variant='default'>Default</Badge>
              <Badge variant='primary'>Primary</Badge>
              <Badge variant='success'>Success</Badge>
              <Badge variant='danger'>Danger</Badge>
              <Badge variant='warning'>Warning</Badge>
              <Badge variant='info'>Info</Badge>
            </BadgeGroup>

            <BadgeGroup>
              <StatusBadge status='active' />
              <StatusBadge status='inactive' />
              <StatusBadge status='pending' />
              <PriorityBadge priority='high' />
              <CountBadge count={42} />
              <RoleBadge role='Admin' isSystemRole />
              <PermissionBadge permission='read' effect='allow' />
            </BadgeGroup>

            <BadgeGroup>
              {selectedTags.map(tag => (
                <TagBadge key={tag} tag={tag} onRemove={() => removeTag(tag)} />
              ))}
            </BadgeGroup>
          </div>
        </CardBody>
      </Card>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Messages and notifications</CardDescription>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            <Alert variant='info' title='Information'>
              This is an informational message.
            </Alert>

            <Alert variant='success' title='Success'>
              Operation completed successfully!
            </Alert>

            <Alert variant='warning' title='Warning'>
              Please review your settings.
            </Alert>

            <Alert
              variant='danger'
              title='Error'
              onClose={() => {
                /* Alert closed */
              }}
            >
              Something went wrong. Please try again.
            </Alert>

            <div className='flex space-x-2'>
              <InlineAlert variant='info'>Inline info</InlineAlert>
              <InlineAlert variant='warning' size='sm'>
                Small warning
              </InlineAlert>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Modals</CardTitle>
          <CardDescription>Dialog and overlay components</CardDescription>
        </CardHeader>
        <CardBody>
          <ButtonGroup>
            <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
            <Button
              variant='danger'
              onClick={() => setIsConfirmModalOpen(true)}
            >
              Open Confirmation
            </Button>
          </ButtonGroup>
        </CardBody>
      </Card>

      {/* Loading States Section */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States</CardTitle>
          <CardDescription>
            Loading indicators and skeleton screens
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <LoadingSpinner size='sm' />
              <LoadingSpinner size='md' />
              <LoadingSpinner size='lg' />
            </div>

            <SkeletonCard />
          </div>
        </CardBody>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title='Example Modal'
        size='md'
      >
        <p className='text-gray-600 mb-4'>
          This is an example modal with some content.
        </p>
        <ButtonGroup>
          <Button variant='secondary' onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
        </ButtonGroup>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          // Action confirmed
          setIsConfirmModalOpen(false);
        }}
        title='Confirm Action'
        message='Are you sure you want to perform this action?'
        variant='danger'
        confirmText='Delete'
        cancelText='Cancel'
      />
    </div>
  );
};
