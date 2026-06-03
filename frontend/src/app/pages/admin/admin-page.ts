import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CATEGORIAS_PRODUTO } from '../../utils/products';
import { Produto } from '../../utils/models';
import { LojaServico } from '../../utils/store.service';

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class PaginaAdminComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(LojaServico);

  readonly user = this.store.loggedUser;
  readonly isAdmin = this.store.isAdmin;
  readonly products = computed(() =>
    [...this.store.products()].sort((first, second) => first.name.localeCompare(second.name)),
  );
  readonly categories = CATEGORIAS_PRODUTO;
  message = '';
  isSaving = false;
  isDraggingImage = false;
  deletingId: number | null = null;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(140)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    image: ['', [Validators.required]],
    category: [this.categories[0], [Validators.required]],
    description: ['', [Validators.required, Validators.maxLength(700)]],
    sizesText: ['P, M, G', [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const sizes = this.parseSizes(value.sizesText ?? '');

    if (!sizes.length) {
      this.message = 'Informe ao menos um tamanho valido.';
      return;
    }

    this.isSaving = true;
    const result = await this.store.cadastrarProduto({
      name: value.name ?? '',
      price: Number(value.price ?? 0),
      image: value.image ?? '',
      category: value.category ?? this.categories[0],
      description: value.description ?? '',
      sizes,
    });
    this.isSaving = false;
    this.message = result.message;

    if (result.success) {
      this.form.patchValue({
        name: '',
        price: 0,
        image: '',
        category: this.categories[0],
        description: '',
        sizesText: 'P, M, G',
      });
      this.form.markAsPristine();
      this.form.markAsUntouched();
    }
  }

  openImagePicker(input: HTMLInputElement): void {
    input.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      void this.useImageFile(file);
    }

    input.value = '';
  }

  onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingImage = true;
  }

  onImageDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingImage = false;
  }

  onImageDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingImage = false;

    const file = event.dataTransfer?.files?.[0];

    if (file) {
      void this.useImageFile(file);
    }
  }

  async removerProduto(product: Produto): Promise<void> {
    const confirmed = window.confirm(`Remover o produto "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    this.deletingId = product.id;
    const result = await this.store.removerProduto(product.id);
    this.deletingId = null;
    this.message = result.message;
  }

  trackById(_: number, product: Produto): number {
    return product.id;
  }

  private parseSizes(value: string): string[] {
    return [
      ...new Set(
        value
          .split(',')
          .map((size) => size.trim())
          .filter(Boolean),
      ),
    ];
  }

  private async useImageFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this.message = 'Selecione um arquivo de imagem.';
      return;
    }

    try {
      const image = await this.resizeImage(file);
      this.form.controls.image.setValue(image);
      this.form.controls.image.markAsDirty();
      this.message = 'Imagem carregada com sucesso.';
    } catch {
      this.message = 'Nao foi possivel carregar a imagem selecionada.';
    }
  }

  private async resizeImage(file: File): Promise<string> {
    const source = await this.readFileAsDataUrl(file);

    if (file.type === 'image/svg+xml') {
      return source;
    }

    const image = await this.loadImage(source);
    const maxSize = 900;
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
      return source;
    }

    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', 0.86);
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  private loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = source;
    });
  }
}
