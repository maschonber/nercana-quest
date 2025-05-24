import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Hero } from '../models/hero.model';

@Component({
  selector: 'app-hero-details',
  template: `
    <div class="hero-details">
      <h2>Hero Details</h2>
      <ul>
        <li><strong>Name:</strong> {{ hero.name }}</li>
        <li><strong>Health:</strong> {{ hero.health }}</li>
        <li><strong>Attack:</strong> {{ hero.attack }}</li>
        <li><strong>Defense:</strong> {{ hero.defense }}</li>
        <li><strong>Luck:</strong> {{ hero.luck }}</li>
      </ul>
      <button class="quest-btn" (click)="onEmbarkOnQuest()">Embark on quest</button>
    </div>
  `,
  styleUrl: './hero-details.component.scss',
  standalone: true
})
export class HeroDetailsComponent {
  @Input() hero!: Hero;
  @Output() embarkOnQuest = new EventEmitter<void>();

  onEmbarkOnQuest(): void {
    this.embarkOnQuest.emit();
  }
}
