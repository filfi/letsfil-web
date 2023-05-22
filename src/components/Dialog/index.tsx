import classNames from 'classnames';
import { useIntl } from '@umijs/max';
import { createElement, forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import SpinBtn from '../SpinBtn';
import { isStr } from '@/utils/utils';
import Modal, { renderModalIcon } from '../Modal';
import { mountPortal, unmountPortal } from '@/helpers/app';
import type { ModalProps } from '../Modal';

export type DialogProps = Omit<ModalProps, 'content' | 'showConfirm' | 'showFooter' | 'showHeader'> & {
  summary?: React.ReactNode;
  cancelBtnVariant?: 'danger' | 'primary' | 'warning';
  confirmBtnVariant?: 'danger' | 'primary' | 'warning';
};

export type DialogOptions = Omit<DialogProps, 'children'> & { content?: React.ReactNode };
export type ConfirmProps = Omit<DialogProps, 'showCancel'>;
export type AlertProps = Omit<ConfirmProps, 'cancelText' | 'onCancel'>;
export type AlertOptions = Omit<AlertProps, 'children'> & { content?: React.ReactNode };
export type ConfirmOptions = Omit<ConfirmProps, 'children'> & { content?: React.ReactNode };
export type DialogStatic = React.ForwardRefExoticComponent<DialogProps & React.RefAttributes<ModalAttrs>> & {
  Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<ModalAttrs>>;
  Confirm: React.ForwardRefExoticComponent<ConfirmProps & React.RefAttributes<ModalAttrs>>;
  show: (msgOrOpts: string | DialogOptions) => ModalAttrs['hide'];
  alert: (msgOrOpts: string | AlertOptions) => ModalAttrs['hide'];
  confirm: (msgOrOpts: string | ConfirmOptions) => ModalAttrs['hide'];
};

const DialogRender: React.ForwardRefRenderFunction<ModalAttrs, DialogProps> = (
  {
    icon,
    title,
    summary,
    children,
    cancelText,
    confirmText,
    bodyClassName,
    footerClassName,
    headerClassName,
    titleClassName,
    showCancel,
    closable = true,
    confirmLoading,
    cancelBtnVariant,
    confirmBtnVariant = 'primary',
    onCancel,
    onConfirm,
    ...props
  },
  ref?: React.Ref<ModalAttrs> | null,
) => {
  const modal = useRef<ModalAttrs>(null);

  const { formatMessage } = useIntl();

  useImperativeHandle(
    ref,
    () => ({
      hide: () => modal.current?.hide(),
      show: () => modal.current?.show(),
      toggle: () => modal.current?.toggle(),
    }),
    [],
  );

  const handleCancel = () => {
    onCancel?.();

    modal.current?.hide();
  };

  const handleConfirm = useCallback(async () => {
    let r = onConfirm?.();

    if (r instanceof Promise) {
      r = await r;
    }

    if (r === false) return;

    modal.current?.hide();
  }, [onConfirm]);

  return (
    <Modal {...props} ref={modal} showFooter={false} showHeader={false}>
      <div className="d-flex">
        <div className="modal-icon flex-shrink-0 me-3">{renderModalIcon(icon)}</div>

        <div className="flex-grow-1">
          <div className="d-flex justify-content-between">
            <div className={classNames('align-self-center', headerClassName)}>
              {isStr(title) ? <h1 className={classNames('modal-title', titleClassName)}>{title}</h1> : title}

              {isStr(summary) ? <p className="text-gray mt-1 mb-0">{summary}</p> : summary}
            </div>
            {closable && <button type="button" className="btn-close align-self-start" aria-label="Close" data-bs-dismiss="modal"></button>}
          </div>
          <div className={classNames('py-3', bodyClassName)}>{children}</div>

          <div className={classNames('d-flex justify-content-end gap-3', footerClassName)}>
            {showCancel && (
              <button
                type="button"
                className={classNames('btn', {
                  'btn-light': !cancelBtnVariant,
                  'btn-danger': cancelBtnVariant === 'danger',
                  'btn-primary': cancelBtnVariant === 'primary',
                  'btn-warning': cancelBtnVariant === 'warning',
                })}
                onClick={handleCancel}
              >
                {cancelText ?? formatMessage({ id: 'actions.button.cancel' })}
              </button>
            )}

            <SpinBtn
              className={classNames('btn', {
                'btn-danger': confirmBtnVariant === 'danger',
                'btn-primary': confirmBtnVariant === 'primary',
                'btn-warning': confirmBtnVariant === 'warning',
              })}
              loading={confirmLoading}
              onClick={handleConfirm}
            >
              {confirmText ?? formatMessage({ id: 'actions.button.confirm' })}
            </SpinBtn>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const Dialog = forwardRef(DialogRender) as DialogStatic;
const StaticRender: React.ForwardRefRenderFunction<ModalAttrs, DialogProps> = (props, ref?: React.Ref<ModalAttrs>) => {
  const modal = useRef<ModalAttrs>(null);

  useImperativeHandle(
    ref,
    () => ({
      hide: () => modal.current?.hide(),
      show: () => modal.current?.show(),
      toggle: () => modal.current?.toggle(),
    }),
    [],
  );

  return <Dialog ref={modal} {...props} />;
};

const AlertRender = (props: AlertProps, ref: React.ForwardedRef<ModalAttrs>) => StaticRender(props, ref);
const ConfirmRender = (props: ConfirmProps, ref: React.ForwardedRef<ModalAttrs>) => StaticRender({ ...props }, ref);

const Alert = forwardRef<ModalAttrs, AlertProps>(AlertRender);
const Confirm = forwardRef<ModalAttrs, ConfirmProps>(ConfirmRender);

function show<O extends DialogOptions>(msgOrOpts: string | O) {
  let modal: ModalAttrs | null = null;

  const { content, ...opts } = isStr(msgOrOpts) ? { content: msgOrOpts } : msgOrOpts;
  const props: ModalProps = {
    ...opts,
    children: content,
  };

  const onRef = (ref: ModalAttrs | null) => {
    modal = ref;

    modal?.show();
  };

  const onHidden = () => {
    props.onHidden?.();

    unmountPortal.current?.();
  };

  const node = createElement(Confirm, { ...props, onHidden, ref: onRef });

  mountPortal.current?.(node);

  return () => modal?.hide();
}

const alert: DialogStatic['alert'] = (msgOrOpts) => {
  const ops = isStr(msgOrOpts) ? ({ content: msgOrOpts } as AlertOptions) : msgOrOpts;

  return show({ ...ops, showCancel: false });
};

const confirm: DialogStatic['confirm'] = (msgOrOpts) => {
  const opts = isStr(msgOrOpts) ? ({ content: msgOrOpts } as ConfirmOptions) : msgOrOpts;

  return show({ ...opts, showCancel: true });
};

Dialog.Alert = Alert;
Dialog.Confirm = Confirm;

Dialog.show = show;
Dialog.alert = alert;
Dialog.confirm = confirm;

export default Dialog;
