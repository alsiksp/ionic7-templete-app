import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

interface Widget{
  id: string
  title: string
  type: 'weather' | 'time' | 'moon'
  data: any
  icon: string
}

@Component({
  selector: 'app-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class WidgetComponent implements OnInit {
  loc: any = {};
  currentDate: Date = new Date();
  formattedDate = this.currentDate.toLocaleDateString();
  formattedTime = this.currentDate.toLocaleTimeString();

  widgets: Widget[] = [
    { 
      id: 'weather', 
      title: 'Погода в Москве', 
      type: 'weather', 
      data: { temperature: null, description: null },
      icon: 'partly-sunny'
    },
    { 
      id: 'time', 
      title: 'Текущее время', 
      type: 'time', 
      data: { time: this.formattedTime, date: this.formattedDate },
      icon: 'time'
    },
    { 
      id: 'moon', 
      title: 'Фаза Луны', 
      type: 'moon', 
      data: { phase: null, illumination: null, age: null },
      icon: 'moon'
    },
  ];
   
   moonPhases = [
    { name: 'Новолуние', emoji: '🌑', min: 0, max: 1 },
    { name: 'Молодая луна', emoji: '🌒', min: 1, max: 6.38 },
    { name: 'Первая четверть', emoji: '🌓', min: 6.38, max: 8.38 },
    { name: 'Прибывающая луна', emoji: '🌔', min: 8.38, max: 13.38 },
    { name: 'Полнолуние', emoji: '🌕', min: 13.38, max: 15.38 },
    { name: 'Убывающая луна', emoji: '🌖', min: 15.38, max: 20.38 },
    { name: 'Последняя четверть', emoji: '🌗', min: 20.38, max: 22.38 },
    { name: 'Старая луна', emoji: '🌘', min: 22.38, max: 29.53 }
  ];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getWeatherData();
    this.startTimeUpdate();
    this.getMoonPhase();
    this.loc = {
      COMPONENT_TITLE: 'Виджеты',
      LOADING: 'Загрузка',
      MOON_PHASE: 'Фаза',
      MOON_AGE: 'Возраст луны',
      DAYS: 'дней'
    };
  }

  getWeatherData() {
  const url = 'https://wttr.in/Moscow?format=j1';
  
  this.http.get(url).subscribe({
    next: (data: any) => {
      const current = data.current_condition[0];
      this.widgets[0].data = {
        temperature: `${current.temp_C}°C`,
        description: current.weatherDesc[0].value,
      };
    },
      error: (error) => {
        console.log('Ошибка загрузки погоды:', error);
        this.widgets[0].data = {
          temperature: null,
          description: null
        };
      }
    });
  }

  startTimeUpdate() {
    setInterval(() => {
      this.currentDate = new Date();
      this.widgets[1].data = {
        time: this.currentDate.toLocaleTimeString(),
        date: this.currentDate.toLocaleDateString()
      };
    }, 1000);
  }

   getMoonPhase() {
    setTimeout(() => {
      const moonData = this.calculateMoonPhase(this.currentDate);
      this.widgets[2].data = moonData;
    }, 1000);
  }

  calculateMoonPhase(date: Date): any {
    const knownNewMoon = new Date('2025-10-21T00:00:00Z').getTime();
    const currentTime = date.getTime();
    
    // Лунный цикл в миллисекундах (29.53 дней)
    const lunarCycleMs = 29.53 * 24 * 60 * 60 * 1000;
    
    // Прошедшее время с известного новолуния
    const timeSinceNewMoon = currentTime - knownNewMoon;
    
    // Возраст луны в днях
    let moonAge = (timeSinceNewMoon % lunarCycleMs) / (24 * 60 * 60 * 1000);
    if (moonAge < 0) moonAge += 29.53;
    
    // Определение фазы луны
    const phase = this.determineMoonPhase(moonAge);
    
    return {
      phase: phase.name,
      emoji: phase.emoji,
      age: Math.round(moonAge * 10) / 10 + ' ' + this.loc.DAYS,
      description: this.getPhaseDescription(phase.name)
    };
  }

  // Определение фазы луны по возрасту
  determineMoonPhase(moonAge: number): any {
    for (let phase of this.moonPhases) {
      if (moonAge >= phase.min && moonAge < phase.max) {
        return phase;
      }
    }
    return this.moonPhases[0];
  }

  getPhaseDescription(phaseName: string): string {
    const descriptions: any = {
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