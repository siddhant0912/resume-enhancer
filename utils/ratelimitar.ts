import {RateLimiterMemory } from 'rate-limiter-flexible';

export const dailyLimiter = new RateLimiterMemory ({
  duration:  24 * 60 * 60, 
  points: 1,                   
});
