import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Aplicativo } from './app';
import { routes } from './app.routes';

describe('Aplicativo', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Aplicativo],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('cria a aplicação', () => {
    const fixture = TestBed.createComponent(Aplicativo);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('exibe a marca atualizada', async () => {
    const fixture = TestBed.createComponent(Aplicativo);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Garibas Store');
  });
});
