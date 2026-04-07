import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StoreService } from '../../utils/store.service';

interface ContactFeedback {
  type: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

const FEEDBACKS_KEY = 'store-feedbacks';
const DEFAULT_FEEDBACK_TYPE = 'avaliacao';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent implements OnDestroy {
  readonly user = inject(StoreService).loggedUser;
  readonly isContactOpen = signal(false);
  readonly feedbackSaved = signal(false);
  readonly contactTopics = [
    { value: 'avaliacao', label: 'Avaliacao' },
    { value: 'recomendacao', label: 'Recomendacao' },
    { value: 'reclamacao', label: 'Reclamacao' }
  ];

  feedbackType = DEFAULT_FEEDBACK_TYPE;
  feedbackName = '';
  feedbackEmail = '';
  feedbackMessage = '';

  openContact(): void {
    this.feedbackSaved.set(false);
    this.isContactOpen.set(true);
    this.setDocumentScrollLocked(true);
  }

  closeContact(): void {
    this.feedbackSaved.set(false);
    this.isContactOpen.set(false);
    this.setDocumentScrollLocked(false);
  }

  submitFeedback(form: NgForm): void {
    const feedback: ContactFeedback = {
      type: this.feedbackType.trim(),
      name: this.feedbackName.trim(),
      email: this.feedbackEmail.trim(),
      message: this.feedbackMessage.trim(),
      createdAt: new Date().toISOString()
    };

    if (!feedback.name || !feedback.email || !feedback.message) {
      return;
    }

    const storedFeedbacks = this.readFeedbacks();
    storedFeedbacks.unshift(feedback);
    localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(storedFeedbacks));

    this.feedbackSaved.set(true);
    this.feedbackType = DEFAULT_FEEDBACK_TYPE;
    this.feedbackName = '';
    this.feedbackEmail = '';
    this.feedbackMessage = '';

    form.resetForm({
      feedbackType: DEFAULT_FEEDBACK_TYPE,
      feedbackName: '',
      feedbackEmail: '',
      feedbackMessage: ''
    });
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    if (this.isContactOpen()) {
      this.closeContact();
    }
  }

  ngOnDestroy(): void {
    this.setDocumentScrollLocked(false);
  }

  private readFeedbacks(): ContactFeedback[] {
    try {
      const raw = localStorage.getItem(FEEDBACKS_KEY);
      return raw ? (JSON.parse(raw) as ContactFeedback[]) : [];
    } catch {
      return [];
    }
  }

  private setDocumentScrollLocked(locked: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.style.overflow = locked ? 'hidden' : '';
  }
}
