import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CapDeSetmana, Equip, Match } from '../../../Core/Models';
import { EquipsService } from '../../../Core/Services/equips.service';

@Component({
  selector: 'app-new-match-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-match-form.html',
  styleUrl: './new-match-form.scss',
})
export class NewMatchForm {
  private readonly formBuilder = inject(FormBuilder);
  private readonly equipsService = inject(EquipsService);

  @Input() capSeleccionat: CapDeSetmana | null = null;
  @Input() estaEditant = false;

  private _partitEnEdicio: Match | null = null;
  @Input()
  set partitEnEdicio(value: Match | null) {
    this._partitEnEdicio = value;

    if (value) {
      this.form.setValue({
        dia: value.dia,
        hora: value.hora,
        local: value.local,
        visitant: value.visitant,
        resultat: value.resultat ?? '',
        observacions: value.observacions ?? '',
      });

      this.actualitzaFiltreLocal(value.local);
      this.actualitzaFiltreVisitant(value.visitant);
      return;
    }

    this.resetForm();
  }

  @Output() readonly desa = new EventEmitter<Match>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly form = this.formBuilder.nonNullable.group({
    dia: ['', Validators.required],
    hora: ['', Validators.required],
    local: ['', Validators.required],
    visitant: ['', Validators.required],
    resultat: [''],
    observacions: [''],
  });

  readonly equips = toSignal(this.equipsService.getEquips(), { initialValue: [] as Equip[] });
  readonly filtreLocal = signal('');
  readonly filtreVisitant = signal('');

  readonly equipsLocal = computed(() => this.filtraEquips(this.filtreLocal()));
  readonly equipsVisitant = computed(() => this.filtraEquips(this.filtreVisitant()));

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { dia, hora, local, visitant, resultat, observacions } = this.form.getRawValue();

    const partit: Match = {
      dia,
      hora,
      local,
      visitant,
      resultat: resultat.trim() ? resultat.trim() : undefined,
      observacions: observacions.trim() ? observacions.trim() : undefined,
    };

    this.desa.emit(partit);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  actualitzaFiltreLocal(valor: string): void {
    this.filtreLocal.set(valor ?? '');
  }

  actualitzaFiltreVisitant(valor: string): void {
    this.filtreVisitant.set(valor ?? '');
  }

  private filtraEquips(filtre: string): Equip[] {
    const criteri = filtre.trim().toLowerCase();
    const equips = this.equips();

    if (!criteri) {
      return equips;
    }

    return equips.filter((equip) => equip.nom.toLowerCase().includes(criteri));
  }

  private resetForm(): void {
    this.form.reset({
      dia: '',
      hora: '',
      local: '',
      visitant: '',
      resultat: '',
      observacions: '',
    });

    this.reiniciaFiltresEquips();
  }

  private reiniciaFiltresEquips(): void {
    this.filtreLocal.set('');
    this.filtreVisitant.set('');
  }
}
