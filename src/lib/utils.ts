import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const themeGradients = {
  ocean: 'from-teal-50 to-cyan-50',
  sunset: 'from-orange-50 to-yellow-50',
  forest: 'from-green-50 to-emerald-50',
  royal: 'from-indigo-50 to-purple-50',
  blossom: 'from-pink-50 to-rose-50',
};

export const themePrimaryColors = {
  ocean: 'bg-teal-500 text-white',
  sunset: 'bg-orange-500 text-white',
  forest: 'bg-green-500 text-white',
  royal: 'bg-indigo-500 text-white',
  blossom: 'bg-pink-500 text-white',
};

export const themeTextColors = {
  ocean: 'text-teal-600',
  sunset: 'text-orange-600',
  forest: 'text-green-600',
  royal: 'text-indigo-600',
  blossom: 'text-pink-600',
};

export const themeBorderColors = {
  ocean: 'border-teal-500',
  sunset: 'border-orange-500',
  forest: 'border-green-500',
  royal: 'border-indigo-500',
  blossom: 'border-pink-500',
};

export const themeBgLight = {
  ocean: 'bg-teal-50 text-teal-700',
  sunset: 'bg-orange-50 text-orange-700',
  forest: 'bg-green-50 text-green-700',
  royal: 'bg-indigo-50 text-indigo-700',
  blossom: 'bg-pink-50 text-pink-700',
};
