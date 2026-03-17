import { useState, useCallback, useEffect } from 'react';
import { tourSteps } from '../../config/tourSteps';

const TOUR_STORAGE_KEY = 'setorigin-tour-completed';

/**
 * Custom hook for managing the application tour
 * 
 * Handles tour state, progression, and persistence via localStorage.
 * 
 * @returns {Object} Tour state and control functions
 * 
 * @example
 * const { isTourActive, currentStep, startTour, nextStep } = useTour();
 */
const useTour = () => {
    const [isTourActive, setIsTourActive] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [hasSeenTour, setHasSeenTour] = useState(false);

    // Check if user has completed tour before
    useEffect(() => {
        try {
            const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
            setHasSeenTour(tourCompleted === 'true');
        } catch (error) {
            console.warn('Failed to check tour status:', error);
            setHasSeenTour(false);
        }
    }, []);

    /**
     * Start the tour from the beginning
     */
    const startTour = useCallback(() => {
        setCurrentStepIndex(0);
        setIsTourActive(true);
    }, []);

    /**
     * End the tour and mark as completed
     */
    const endTour = useCallback(() => {
        setIsTourActive(false);
        setCurrentStepIndex(0);

        // Mark tour as completed
        try {
            localStorage.setItem(TOUR_STORAGE_KEY, 'true');
            setHasSeenTour(true);
        } catch (error) {
            console.warn('Failed to save tour completion:', error);
        }
    }, []);

    /**
     * Move to the next tour step
     */
    const nextStep = useCallback(() => {
        if (currentStepIndex < tourSteps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            // Last step - end tour
            endTour();
        }
    }, [currentStepIndex, endTour]);

    /**
     * Move to the previous tour step
     */
    const previousStep = useCallback(() => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
        }
    }, [currentStepIndex]);

    /**
     * Jump to a specific tour step
     */
    const goToStep = useCallback((stepIndex) => {
        if (stepIndex >= 0 && stepIndex < tourSteps.length) {
            setCurrentStepIndex(stepIndex);
        }
    }, []);

    /**
     * Reset tour (mark as not seen)
     */
    const resetTour = useCallback(() => {
        try {
            localStorage.removeItem(TOUR_STORAGE_KEY);
            setHasSeenTour(false);
            setIsTourActive(false);
            setCurrentStepIndex(0);
        } catch (error) {
            console.warn('Failed to reset tour:', error);
        }
    }, []);

    return {
        isTourActive,
        currentStepIndex,
        currentStep: tourSteps[currentStepIndex],
        totalSteps: tourSteps.length,
        hasSeenTour,
        isFirstStep: currentStepIndex === 0,
        isLastStep: currentStepIndex === tourSteps.length - 1,
        startTour,
        endTour,
        nextStep,
        previousStep,
        goToStep,
        resetTour
    };
};

export default useTour;
