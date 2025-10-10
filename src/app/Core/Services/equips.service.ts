import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, defer, map, of, shareReplay } from 'rxjs';

import { Equip } from '../Models';

@Injectable({ providedIn: 'root' })
export class EquipsService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly equips$: Observable<Equip[]> = defer(() => {
    if (!isPlatformBrowser(this.platformId)) {
      return of<Equip[]>([]);
    }

    return this.http.get<Equip[]>('/data/equips.json');
  }).pipe(
    map((equips) =>
      equips.map((equip) => ({ nom: equip.nom?.trim() ?? '' })).filter((equip) => !!equip.nom),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getEquips(): Observable<Equip[]> {
    return this.equips$;
  }
}
