import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FooterComponent } from './footer';

describe('FooterComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    document.body.style.overflow = '';

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('should render the contact button and developer links', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const contactButton = compiled.querySelector('.footer__contact-button');
    const linkedinLink = compiled.querySelector(
      'a[href="https://www.linkedin.com/in/gabriel-garibaldi-de-cataldi-759662274/"]'
    );
    const githubLink = compiled.querySelector('a[href="https://github.com/garibas08"]');

    expect(contactButton?.textContent).toContain('Contate-nos');
    expect(compiled.textContent).toContain('desenvolvido por: Gabriel Garibaldi');
    expect(linkedinLink).toBeTruthy();
    expect(githubLink).toBeTruthy();
  });

  it('should save a contact message locally', () => {
    const fixture = TestBed.createComponent(FooterComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openContact();
    component.feedbackType = 'recomendacao';
    component.feedbackName = 'Maria';
    component.feedbackEmail = 'maria@email.com';
    component.feedbackMessage = 'Gostei muito da loja e queria ver mais lancamentos.';
    fixture.detectChanges();

    component.submitFeedback({
      resetForm: () => undefined
    } as never);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const storedFeedbacks = JSON.parse(localStorage.getItem('store-feedbacks') ?? '[]') as Array<{
      type: string;
      name: string;
      email: string;
      message: string;
    }>;

    expect(component.feedbackSaved()).toBe(true);
    expect(compiled.textContent).toContain('Mensagem registrada com sucesso');
    expect(storedFeedbacks).toHaveLength(1);
    expect(storedFeedbacks[0]).toMatchObject({
      type: 'recomendacao',
      name: 'Maria',
      email: 'maria@email.com'
    });
  });
});
