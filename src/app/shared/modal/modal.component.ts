import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, ModalData } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" 
         [ngClass]="{show: modalData.show}" 
         [style.display]="modalData.show ? 'block' : 'none'"
         tabindex="-1" 
         role="dialog">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header" [ngClass]="getHeaderClass()">
            <h5 class="modal-title">{{ modalData.title }}</h5>
            <button type="button" 
                    class="btn-close" 
                    (click)="closeModal()" 
                    aria-label="Close">
            </button>
          </div>
          
          <!-- Modal Body -->
          <div class="modal-body">
            <p [innerHTML]="modalData.message"></p>
          </div>
          
          <!-- Modal Footer -->
          <div class="modal-footer">
            <button type="button" 
                    class="btn btn-secondary" 
                    (click)="handleCancel()"
                    *ngIf="modalData.type === 'confirm'">
              {{ modalData.cancelText }}
            </button>
            <button type="button" 
                    class="btn" 
                    [ngClass]="getConfirmButtonClass()"
                    (click)="handleConfirm()">
              {{ modalData.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show" 
         *ngIf="modalData.show"
         (click)="closeModal()">
    </div>
  `,
  styles: [`
    .modal.show {
      display: block !important;
    }
    
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1040;
    }
    
    .modal {
      z-index: 1050;
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
  modalData: ModalData = {
    show: false,
    type: 'info',
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancel'
  };

  private subscription: Subscription = new Subscription();

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.subscription = this.modalService.modalData$.subscribe(data => {
      this.modalData = data;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  closeModal() {
    this.modalService.close();
  }

  handleConfirm() {
    if (this.modalData.onConfirm) {
      this.modalData.onConfirm();
    }
    this.closeModal();
  }

  handleCancel() {
    if (this.modalData.onCancel) {
      this.modalData.onCancel();
    }
    this.closeModal();
  }

  getHeaderClass(): string {
    switch (this.modalData.type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'info':
        return 'bg-info text-white';
      case 'confirm':
        return 'bg-primary text-white';
      default:
        return 'bg-primary text-white';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.modalData.type) {
      case 'success':
        return 'btn-success';
      case 'error':
        return 'btn-danger';
      case 'info':
        return 'btn-info';
      case 'confirm':
        return 'btn-primary';
      default:
        return 'btn-primary';
    }
  }
}
