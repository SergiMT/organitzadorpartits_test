import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { NewMatchForm } from '../../Components/Forms/new-match-form/new-match-form';
import { CapDeSetmana, Match } from '../../Core/Models';

interface PartitOrdenat {
  partit: Match;
  index: number;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NewMatchForm],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly capsDeSetmana = signal<CapDeSetmana[]>([]);
  readonly mostraFormulariNou = signal(false);
  readonly mostraModalPartit = signal(false);
  readonly mostraModalLlista = signal(false);
  readonly indexCapSeleccionat = signal<number | null>(null);
  readonly estaEditantPartit = signal(false);
  readonly indexPartitEnEdicio = signal<number | null>(null);
  readonly partitEnEdicio = signal<Match | null>(null);
  readonly indexCapPerLlista = signal<number | null>(null);

  readonly nouCapDeSetmanaForm = this.formBuilder.nonNullable.group({
    dataInici: ['', Validators.required],
    dataFi: ['', Validators.required]
  });

  readonly hiHaCapsDeSetmana = computed(() => this.capsDeSetmana().length > 0);

  readonly capSeleccionat = computed(() => this.#obteCapPerIndex(this.indexCapSeleccionat()));

  readonly capPerLlista = computed(() => this.#obteCapPerIndex(this.indexCapPerLlista()));

  readonly partitsCapSeleccionat = computed(() => this.#partitsOrdenats(this.capSeleccionat()));

  readonly partitsCapPerLlista = computed(() => this.#partitsOrdenats(this.capPerLlista()));

  obreFormulari(): void {
    this.mostraFormulariNou.set(true);
  }

  cancelaCreacio(): void {
    this.nouCapDeSetmanaForm.reset();
    this.mostraFormulariNou.set(false);
  }

  get controlDataInici() {
    return this.nouCapDeSetmanaForm.controls.dataInici;
  }

  get controlDataFi() {
    return this.nouCapDeSetmanaForm.controls.dataFi;
  }

  creaCapDeSetmana(): void {
    if (this.nouCapDeSetmanaForm.invalid) {
      this.nouCapDeSetmanaForm.markAllAsTouched();
      return;
    }

    const { dataInici, dataFi } = this.nouCapDeSetmanaForm.getRawValue();
    const nouCapDeSetmana = new CapDeSetmana(dataInici, dataFi);

    this.capsDeSetmana.update((capsActuals) => [...capsActuals, nouCapDeSetmana]);

    const nouIndex = this.capsDeSetmana().length - 1;
    this.seleccionaCap(nouIndex);
    this.cancelaCreacio();
  }

  seleccionaCap(index: number): void {
    this.indexCapSeleccionat.set(index);
  }

  obreModalPartit(indexCap: number): void {
    this.seleccionaCap(indexCap);
    this.estaEditantPartit.set(false);
    this.indexPartitEnEdicio.set(null);
    this.partitEnEdicio.set(null);
    this.mostraModalPartit.set(true);
  }

  obreModalEditarPartit(indexCap: number, indexPartit: number): void {
    this.seleccionaCap(indexCap);
    const cap = this.capsDeSetmana()[indexCap];
    const partit = cap?.partits[indexPartit];

    if (!partit) {
      return;
    }

    this.partitEnEdicio.set({ ...partit });
    this.estaEditantPartit.set(true);
    this.indexPartitEnEdicio.set(indexPartit);
    this.mostraModalPartit.set(true);
  }

  obreModalLlistaPartits(indexCap: number): void {
    this.indexCapPerLlista.set(indexCap);
    this.mostraModalLlista.set(true);
  }

  eliminaPartit(indexCap: number, indexPartit: number): void {
    this.capsDeSetmana.update((capsActuals) => {
      const actualitzats = capsActuals.map((cap, idx) => {
        if (idx === indexCap) {
          cap.eliminaPartit(indexPartit);
        }

        return cap;
      });

      return actualitzats;
    });
  }

  eliminaCapDeSetmana(indexCap: number): void {
    this.capsDeSetmana.update((capsActuals) => capsActuals.filter((_, idx) => idx !== indexCap));

    if (this.indexCapSeleccionat() === indexCap) {
      this.tancaModalPartit();
    }

    if (this.indexCapPerLlista() === indexCap) {
      this.tancaModalLlista();
    }

    if ((this.indexCapSeleccionat() ?? -1) > indexCap) {
      this.indexCapSeleccionat.update((valor) => (valor !== null ? valor - 1 : valor));
    }

    if ((this.indexCapPerLlista() ?? -1) > indexCap) {
      this.indexCapPerLlista.update((valor) => (valor !== null ? valor - 1 : valor));
    }
  }

  tancaModalPartit(): void {
    this.mostraModalPartit.set(false);
    this.indexPartitEnEdicio.set(null);
    this.estaEditantPartit.set(false);
    this.partitEnEdicio.set(null);
  }

  tancaModalLlista(): void {
    this.mostraModalLlista.set(false);
    this.indexCapPerLlista.set(null);
  }

  desaPartit(partit: Match): void {
    const indexCap = this.indexCapSeleccionat();
    if (indexCap === null) {
      return;
    }

    const indexPartit = this.indexPartitEnEdicio();

    this.capsDeSetmana.update((capsActuals) => {
      const actualitzats = capsActuals.map((cap, idx) => {
        if (idx === indexCap) {
          if (this.estaEditantPartit()) {
            if (indexPartit !== null) {
              cap.actualitzaPartit(indexPartit, partit);
            }
          } else {
            cap.afegeixPartit(partit);
          }
        }

        return cap;
      });

      return actualitzats;
    });

    this.tancaModalPartit();
  }

  #partitsOrdenats(cap: CapDeSetmana | null): PartitOrdenat[] {
    if (!cap) {
      return [];
    }

    return cap.partits
      .map((partit, index) => ({ partit, index }))
      .sort((a, b) => this.#comparaPartits(a.partit, b.partit));
  }

  #obteCapPerIndex(index: number | null): CapDeSetmana | null {
    if (index === null) {
      return null;
    }

    const caps = this.capsDeSetmana();
    return caps[index] ?? null;
  }

  #comparaPartits(a: Match, b: Match): number {
    const diaComparacio = (a.dia ?? '').localeCompare(b.dia ?? '');
    if (diaComparacio !== 0) {
      return diaComparacio;
    }

    const horaA = a.hora ?? '00:00';
    const horaB = b.hora ?? '00:00';
    return horaA.localeCompare(horaB);
  }
}

