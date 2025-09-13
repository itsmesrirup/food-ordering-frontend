import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Box, Typography, Button, Radio, RadioGroup, Checkbox, FormControlLabel, FormGroup, Divider, CircularProgress } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const style = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '90%', maxWidth: 500, bgcolor: 'background.paper', border: '1px solid #ddd',
  borderRadius: 2, boxShadow: 24, p: 4, maxHeight: '90vh', overflowY: 'auto'
};

function CustomizeItemModal({ open, handleClose, menuItem, initialSelections, onSave, isEditing }) {
    const { t } = useTranslation();
    // Default: build blank selections for each option group
    const buildDefaultSelections = () =>
        menuItem.options.reduce((acc, option) => ({ ...acc, [option.id]: [] }), {});

    // --- PATCH: Initialize with previous selections if editing ---
    const [selections, setSelections] = useState(buildDefaultSelections());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset selections when the modal opens for a new item
    useEffect(() => {
        if (isEditing && initialSelections) {
            // Convert initialSelections to the modal's expected format
            // initialSelections: [{optionName, choices}], menuItem.options: [{id, name, ...}]
            const mappedSelections = {};
            menuItem.options.forEach(option => {
                const found = initialSelections.find(sel => sel.optionName === option.name);
                mappedSelections[option.id] = found ? found.choices.map(choiceName => {
                    // Find choice id from name for this option
                    const choiceObj = option.choices.find(ch => ch.name === choiceName);
                    return choiceObj ? choiceObj.id : null;
                }).filter(Boolean) : [];
            });
            setSelections(mappedSelections);
        } else {
            setSelections(buildDefaultSelections());
        }
    }, [open, isEditing, initialSelections, menuItem]);

    if (!menuItem) return null;

    const handleRadioChange = (optionId, choiceId) => {
        setSelections(prev => ({
            ...prev,
            [optionId]: [choiceId] // Radio group selection is an array with one item
        }));
    };

    const handleCheckboxChange = (optionId, choiceId) => {
        setSelections(prev => {
            const currentChoices = prev[optionId] || [];
            if (currentChoices.includes(choiceId)) {
                return { ...prev, [optionId]: currentChoices.filter(id => id !== choiceId) };
            } else {
                return { ...prev, [optionId]: [...currentChoices, choiceId] };
            }
        });
    };
    
    // Check if the current selections are valid according to the rules (min/max choices)
    const isSelectionValid = () => {
        return menuItem.options.every(option => {
            const selectedCount = selections[option.id]?.length || 0;
            return selectedCount >= option.minChoices && selectedCount <= option.maxChoices;
        });
    };

    // On Save:
    // Convert selections back to [{optionName, choices}]
    const handleSubmit = () => {
        const selectedOptionsForCart = menuItem.options.map(option => {
            const selectedChoices = option.choices.filter(choice => selections[option.id]?.includes(choice.id));
            return {
                optionName: option.name,
                choices: selectedChoices.map(c => c.name)
            };
        });
        const itemForCart = {
            ...menuItem,
            selectedOptions: selectedOptionsForCart
        };
        onSave(itemForCart); // <-- PATCH: Use new onSave logic
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h5" component="h2">{menuItem.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{menuItem.description}</Typography>
                <Divider sx={{ my: 2 }} />

                {menuItem.options?.map(option => (
                    <Box key={option.id} sx={{ my: 2 }}>
                        <Typography variant="h6">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {option.minChoices === 1 && option.maxChoices === 1 ? 'Choose 1' : `Choose between ${option.minChoices} and ${option.maxChoices}`}
                        </Typography>
                        
                        {option.maxChoices === 1 ? (
                            // Use Radio buttons for "choose one"
                            <RadioGroup
                                value={selections[option.id]?.[0] || ''}
                                onChange={(e) => handleRadioChange(option.id, parseInt(e.target.value))}
                            >
                                {option.choices.map(choice => (
                                    <FormControlLabel key={choice.id} value={choice.id} control={<Radio />} label={choice.name} />
                                ))}
                            </RadioGroup>
                        ) : (
                            // Use Checkboxes for "choose multiple"
                            <FormGroup>
                                {option.choices.map(choice => (
                                    <FormControlLabel 
                                        key={choice.id} 
                                        control={
                                            <Checkbox
                                                checked={selections[option.id]?.includes(choice.id) || false}
                                                onChange={() => handleCheckboxChange(option.id, choice.id)}
                                                disabled={(selections[option.id]?.length >= option.maxChoices) && !selections[option.id]?.includes(choice.id)}
                                            />
                                        } 
                                        label={choice.name} 
                                    />
                                ))}
                            </FormGroup>
                        )}
                    </Box>
                ))}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        color="secondary"
                        onClick={handleSubmit}
                        disabled={!isSelectionValid() || isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20}/> : <AddShoppingCartIcon />}
                    >
                        Add to Cart
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default CustomizeItemModal;