import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  // BehaviorSubject to track balance changes
  private balanceSubject = new BehaviorSubject<number>(this.getInitialBalance());
  public balance$ = this.balanceSubject.asObservable();

  constructor() { }

  // Get initial balance from localStorage
  private getInitialBalance(): number {
    const storedBalance = localStorage.getItem('balance');
    return storedBalance ? parseFloat(storedBalance) : 0;
  }

  // Get current balance value
  getCurrentBalance(): number {
    return this.balanceSubject.value;
  }

  // Update balance in localStorage and notify subscribers
  updateBalance(newBalance: number): void {
    // Update localStorage
    localStorage.setItem('balance', newBalance.toString());
    
    // Notify all subscribers about the change
    this.balanceSubject.next(newBalance);
    
    console.log('Balance updated to:', newBalance);
  }
}