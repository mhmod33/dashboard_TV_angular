import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DarkModeService {
    private isDarkMode = new BehaviorSubject<boolean>(false);
    public isDarkMode$ = this.isDarkMode.asObservable();

    constructor() {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme) {
            this.isDarkMode.next(JSON.parse(savedTheme));
        }
        this.applyTheme();
    }

    toggleDarkMode(): void {
        const newValue = !this.isDarkMode.value;
        this.isDarkMode.next(newValue);
        localStorage.setItem('darkMode', JSON.stringify(newValue));
        this.applyTheme();
    }

    private applyTheme(): void {
        const isDark = this.isDarkMode.value;
        document.documentElement.classList.toggle('dark-mode', isDark);
    }

    getCurrentMode(): boolean {
        return this.isDarkMode.value;
    }
} 