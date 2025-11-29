import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MoonPhase {
  name: string;
  emoji: string;
  min: number;
  max: number;
}

export interface MoonData {
  phase: string | null;
  emoji: string | null;
  age: string | null;
  description: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MoonService {

  private readonly KNOWN_NEW_MOON = new Date('2024-01-11T11:57:00Z').getTime();
  private readonly LUNAR_CYCLE = 29.5305882; 

  constructor(private http: HttpClient) {}

  getMoonPhases(): Observable<{ moonPhases: MoonPhase[] }> {
    return this.http.get<{ moonPhases: MoonPhase[] }>('assets/sample-data/moon-data.json');
  }

  calculateMoonPhase(date: Date, moonPhases: MoonPhase[]): MoonData {
    const currentTime = date.getTime();

    const diffMs = currentTime - this.KNOWN_NEW_MOON;

    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    let moonAge = diffDays % this.LUNAR_CYCLE;
    
    if (moonAge < 0) {
      moonAge += this.LUNAR_CYCLE;
    }
    
    console.log('Moon calculation debug:', {
      currentDate: date,
      diffDays: diffDays,
      moonAge: moonAge,
      knownNewMoon: new Date(this.KNOWN_NEW_MOON)
    });

    const phase = this.determineMoonPhase(moonAge, moonPhases);
    
    return {
      phase: phase.name,
      emoji: phase.emoji,
      age: `${Math.round(moonAge * 10) / 10} дней`,
      description: this.getPhaseDescription(phase.name)
    };
  }

  private determineMoonPhase(moonAge: number, moonPhases: MoonPhase[]): MoonPhase {
    for (let i = 0; i < moonPhases.length; i++) {
      const phase = moonPhases[i];
      if (moonAge >= phase.min && moonAge < phase.max) {
        console.log(`Found phase: ${phase.name} for age: ${moonAge} (range: ${phase.min}-${phase.max})`);
        return phase;
      }
    }
    
    console.log(`No phase found for age: ${moonAge}, returning last phase`);
    return moonPhases[moonPhases.length - 1];
  }

  private getPhaseDescription(phaseName: string): string {
    const descriptions: Record<string, string> = {
      'Новолуние': 'Луна не видна на небе',
      'Молодая луна': 'Тонкий серп после новолуния',
      'Первая четверть': 'Освещена половина лунного диска',
      'Прибывающая луна': 'Луна продолжает расти',
      'Полнолуние': 'Луна полностью освещена',
      'Убывающая луна': 'Луна начинает уменьшаться',
      'Последняя четверть': 'Освещена вторая половина диска',
      'Старая луна': 'Тонкий серп перед новолунием'
    };
    
    return descriptions[phaseName] || 'Фаза луны';
  }
}