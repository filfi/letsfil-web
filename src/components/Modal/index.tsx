import classNames from 'classnames';
import { useIntl } from '@umijs/max';
import { useEventListener } from 'ahooks';
import { Modal as BSModal } from 'bootstrap';
import { createElement, forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import styles from './styles.less';
import SpinBtn from '@/components/SpinBtn';
import { isDef, isStr } from '@/utils/utils';
import { mountPortal, unmountPortal } from '@/helpers/app';
import { ReactComponent as IconDelete } from '@/assets/icons/delete.svg';
import { ReactComponent as IconDollor } from '@/assets/icons/dollor.svg';
import { ReactComponent as IconDollorWarn } from '@/assets/icons/dollor-warn.svg';
import { ReactComponent as IconEdit } from '@/assets/icons/edit.svg';
import { ReactComponent as IconError } from '@/assets/icons/error.svg';
import { ReactComponent as IconInfo } from '@/assets/icons/info.svg';
import { ReactComponent as IconSafe } from '@/assets/icons/safe.svg';
import { ReactComponent as IconSuccess } from '@/assets/icons/success.svg';
import { ReactComponent as IconTag } from '@/assets/icons/tag.svg';
import { ReactComponent as IconTransfer } from '@/assets/icons/transfer.svg';
import { ReactComponent as IconWarn } from '@/assets/icons/warn.svg';

type DivProps = React.HtmlHTMLAttributes<HTMLDivElement>;

export type IconSet =
  | 'delete'
  | 'dollor'
  | 'dollor-warn'
  | 'edit'
  | 'error'
  | 'info'
  | 'safe'
  | 'success'
  | 'tag'
  | 'transfer'
  | 'warn';

export type ModalProps = Omit<DivProps, 'title'> & {
  icon?: React.ReactNode | IconSet;
  size?: 'sm' | 'lg' | 'xl';
  fade?: boolean;
  modal?: boolean;
  closable?: boolean;
  centered?: boolean;
  confirmLoading?: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showCancel?: boolean;
  showConfirm?: boolean;
  dialogClassName?: classNames.Argument;
  titleClassName?: classNames.Argument;
  headerClassName?: classNames.Argument;
  bodyClassName?: classNames.Argument;
  footerClassName?: classNames.Argument;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  onHide?: () => void;
  onShow?: () => void;
  onShown?: () => void;
  onHidden?: () => void;
  onCancel?: () => void;
  onConfirm?: () => any;
};
export type ConfirmProps = ModalProps; // Omit<ModalProps, 'showCancel' | 'showConfirm'>;
export type AlertProps = Omit<ConfirmProps, 'cancelText' | 'onCancel'>;
export type ModalOptions = Omit<ModalProps, 'children'> & { content?: React.ReactNode };
export type AlertOptions = Omit<AlertProps, 'children'> & { content?: React.ReactNode };
export type ConfirmOptions = Omit<ConfirmProps, 'children'> & { content?: React.ReactNode };
export type ModalStatic = React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<ModalAttrs>> & {
  Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<ModalAttrs>>;
  Confirm: React.ForwardRefExoticComponent<ConfirmProps & React.RefAttributes<ModalAttrs>>;
  show: (msgOrOpts: string | ModalOptions) => ModalAttrs['hide'];
  alert: (msgOrOpts: string | AlertOptions) => ModalAttrs['hide'];
  confirm: (msgOrOpts: string | ConfirmOptions) => ModalAttrs['hide'];
};

function getModal(el: HTMLElement | React.RefObject<HTMLElement>, isStatic?: boolean) {
  const _el = (el as React.RefObject<HTMLElement>).current ?? (el as HTMLElement);
  if (_el) {
    const options: Partial<BSModal.Options> = isStatic
      ? {
          keyboard: false,
          backdrop: 'static',
        }
      : {};

    let modal = BSModal.getOrCreateInstance(_el, options);

    if (!modal) {
      modal = new BSModal(_el, options);
    }

    return modal;
  }
}

export function renderModalIcon(icon?: IconSet | React.ReactNode) {
  switch (icon) {
    case 'delete':
      return <IconDelete />;
    case 'dollor':
      return <IconDollor />;
    case 'dollor-warn':
      return <IconDollorWarn />;
    case 'edit':
      return <IconEdit />;
    case 'error':
      return <IconError />;
    case 'info':
      return <IconInfo />;
    case 'safe':
      return <IconSafe />;
    case 'success':
      return <IconSuccess />;
    case 'tag':
      return <IconTag />;
    case 'transfer':
      return <IconTransfer />;
    case 'warn':
      return <IconWarn />;
    default:
      return icon ?? <IconInfo />;
  }
}

const ModalRender: React.ForwardRefRenderFunction<ModalAttrs, ModalProps> = (
  {
    size,
    modal,
    title,
    children,
    className,
    confirmLoading,
    dialogClassName,
    titleClassName,
    bodyClassName,
    headerClassName,
    footerClassName,
    cancelText,
    confirmText,
    showCancel,
    fade = true,
    icon = 'info',
    centered = true,
    closable = true,
    showHeader = true,
    showFooter = true,
    showConfirm = true,
    renderHeader,
    renderFooter,
    onHide,
    onShow,
    onShown,
    onHidden,
    onCancel,
    onConfirm,
    ...props
  },
  ref?: React.Ref<ModalAttrs> | null,
) => {
  const el = useRef<HTMLDivElement>(null);

  const { formatMessage } = useIntl();

  const handleHide = () => getModal(el, modal)?.hide();
  const handleShow = () => getModal(el, modal)?.show();
  const handleToggle = () => getModal(el, modal)?.toggle();

  const handleCancel = useCallback(() => {
    onCancel?.();

    handleHide();
  }, [onCancel]);

  const handleConfirm = useCallback(async () => {
    let r = onConfirm?.();

    if (r instanceof Promise) {
      r = await r;
    }

    if (r === false) return;

    handleHide();
  }, [onConfirm]);

  const _onHide = useCallback(() => onHide?.(), [onHide]);
  const _onHidden = useCallback(() => onHidden?.(), [onHidden]);
  const _onShow = useCallback(() => onShow?.(), [onShow]);
  const _onShown = useCallback(() => onShown?.(), [onShown]);

  useImperativeHandle(
    ref,
    () => ({
      hide: handleHide,
      show: handleShow,
      toggle: handleToggle,
    }),
    [],
  );

  useEventListener('hide.bs.modal', _onHide, { target: el });
  useEventListener('hidden.bs.modal', _onHidden, { target: el });
  useEventListener('show.bs.modal', _onShow, { target: el });
  useEventListener('shown.bs.modal', _onShown, { target: el });

  const _renderHeader = () => {
    if (!showHeader) return null;

    if (renderHeader) {
      return <div className={classNames('modal-header', headerClassName)}>{renderHeader()}</div>;
    }

    return (
      <div className={classNames('modal-header', headerClassName)}>
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-2">
            <div className="modal-icon">{renderModalIcon(icon)}</div>
          </div>

          <div className="flex-grow-1">
            {isDef(title) &&
              (isStr(title) ? <h1 className={classNames('modal-title', titleClassName)}>{title}</h1> : title)}
          </div>
        </div>

        {closable && (
          <button
            type="button"
            className="btn-close align-self-start"
            aria-label="Close"
            data-bs-dismiss="modal"
          ></button>
        )}
      </div>
    );
  };

  const renderBtns = () => {
    const btns: React.ReactNode[] = [];

    if (showCancel) {
      btns.push(
        <button key="cancel" className="btn btn-lg btn-light flex-fill" type="button" onClick={handleCancel}>
          {cancelText ?? formatMessage({ id: 'actions.button.cancel' })}
        </button>,
      );
    }

    if (showConfirm) {
      btns.push(
        <SpinBtn
          key="confirm"
          loading={confirmLoading}
          className="btn btn-lg btn-primary flex-fill"
          onClick={handleConfirm}
        >
          {confirmText ?? formatMessage({ id: 'actions.button.confirm' })}
        </SpinBtn>,
      );
    }

    return btns;
  };

  const _renderFooter = () => {
    if (!showFooter) return null;

    if (renderFooter) {
      return <div className={classNames('modal-footer', footerClassName)}>{renderFooter()}</div>;
    }

    const btns = renderBtns();

    return (
      <div className={classNames('modal-footer', { 'flex-column': btns.length > 2 }, footerClassName)}>{btns}</div>
    );
  };

  return (
    <div
      ref={el}
      className={classNames('modal', styles.modal, { fade }, className)}
      tabIndex={-1}
      aria-hidden="true"
      aria-labelledby="modal"
      {...props}
    >
      <div
        className={classNames(
          'modal-dialog',
          {
            'modal-sm': size === 'sm',
            'modal-lg': size === 'lg',
            'modal-xl': size === 'xl',
            'modal-dialog-centered': centered,
          },
          dialogClassName,
        )}
      >
        <div className="modal-content">
          {_renderHeader()}

          <div className={classNames('modal-body text-break', bodyClassName)}>{children}</div>

          {_renderFooter()}
        </div>
      </div>
    </div>
  );
};

const Modal = forwardRef(ModalRender) as ModalStatic;
const StaticRender: React.ForwardRefRenderFunction<ModalAttrs, ModalProps> = (props, ref?: React.Ref<ModalAttrs>) => {
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

  return <Modal ref={modal} {...props} />;
};

const AlertRender = (props: AlertProps, ref: React.ForwardedRef<ModalAttrs>) => StaticRender(props, ref);
const ConfirmRender = (props: ConfirmProps, ref: React.ForwardedRef<ModalAttrs>) =>
  StaticRender({ showCancel: true, ...props }, ref);

const Alert = forwardRef<ModalAttrs, AlertProps>(AlertRender);
const Confirm = forwardRef<ModalAttrs, ConfirmProps>(ConfirmRender);

function show<O extends ModalOptions>(msgOrOpts: string | O) {
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

const alert: ModalStatic['alert'] = (msgOrOpts) => {
  const opts = isStr(msgOrOpts) ? ({ content: msgOrOpts } as AlertOptions) : msgOrOpts;

  return show({ ...opts, showCancel: false });
};

const confirm: ModalStatic['confirm'] = (msgOrOpts) => {
  const opts = isStr(msgOrOpts) ? ({ content: msgOrOpts } as ConfirmOptions) : msgOrOpts;

  return show({
    ...opts,
    showCancel: true,
  });
};

Modal.Alert = Alert;
Modal.Confirm = Confirm;

Modal.show = show;
Modal.alert = alert;
Modal.confirm = confirm;

export default Modal;
