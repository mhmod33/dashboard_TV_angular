import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalData {
  show: boolean;
  type: 'info' | 'confirm' | 'success' | 'error';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalData = new BehaviorSubject<ModalData>({
    show: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel'
  });

  modalData$ = this.modalData.asObservable();

  // Show info modal (single button)
  showInfo(title: string, message: string) {
    this.modalData.next({
      show: true,
      type: 'info',
      title,
      message,
      confirmText: 'OK'
    });
  }

  // Show success modal (single button)
  showSuccess(title: string, message: string) {
    this.modalData.next({
      show: true,
      type: 'success',
      title,
      message,
      confirmText: 'OK'
    });
  }

  // Show error modal (single button)
  showError(title: string, message: string) {
    this.modalData.next({
      show: true,
      type: 'error',
      title,
      message,
      confirmText: 'OK'
    });
  }

  // Show confirmation modal (two buttons)
  showConfirm(title: string, message: string, onConfirm: () => void, onCancel?: () => void, confirmText = 'Yes', cancelText = 'No') {
    this.modalData.next({
      show: true,
      type: 'confirm',
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    });
  }

  // Close modal
  close() {
    this.modalData.next({
      ...this.modalData.value,
      show: false
    });
  }

  // Quick methods for common use cases
  showSuccessMessage(message: string) {
    this.showSuccess('Success', message);
  }

  showErrorMessage(message: string) {
    this.showError('Error', message);
  }

  showInfoMessage(message: string) {
    this.showInfo('Information', message);
  }
}
