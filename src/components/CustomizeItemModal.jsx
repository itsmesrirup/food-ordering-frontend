import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Box, Typography, Button, Radio, RadioGroup, Checkbox, FormControlLabel, FormGroup, Divider, CircularProgress } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const style = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '90%', maxWidth: 500, bgcolor: 'background.paper', border: '1px solid #ddd',
  borderRadius: 2, boxShadow: 24, p: 4, maxHeight: '90vh', overflowY: 'auto'
};

// This component receives the full menuItem object with all options as a prop.
function CustomizeItemModal({ open, handleClose, menuItem, handleAddToCart }) {
    const { t } = useTranslation();
    const [selections, setSelections] = useState({});

    // Reset the internal selections state whenever the modal is opened for a new item.
    useEffect(() => {
        if (open) {
            setSelections({});
        }
    }, [open]);

    // This is the safety guard. If the modal is open but has no item, or the item has no options, don't render.
    if (!menuItem || !menuItem.options) {
        return null;
    }

    const handleRadioChange = (optionId, choiceId) => {
        setSelections(prev => ({
            ...prev,
            [optionId]: [parseInt(choiceId)] // Store the selected choice ID
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
    
    // Check if the current selections meet the min/max requirements for all option groups.
    const isSelectionValid = () => {
        return menuItem.options.every(option => {
            const selectedCount = selections[option.id]?.length || 0;
            return selectedCount >= option.minChoices && selectedCount <= option.maxChoices;
        });
    };

    const handleSubmit = () => {
        // Create a user-friendly summary of the selections to be displayed in the cart.
        const selectedOptionsForCart = menuItem.options.flatMap(option => {
            const selectedChoiceIds = selections[option.id] || [];
            return option.choices
                .filter(choice => selectedChoiceIds.includes(choice.id))
                .map(choice => `${option.name}: ${choice.name}`);
        });

        // Create the final item object to be added to the cart.
        const itemForCart = {
            ...menuItem,
            selectedOptions: selectedOptionsForCart
        };
        
        handleAddToCart(itemForCart);
        handleClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h5" component="h2">{menuItem.name}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{menuItem.description}</Typography>
                <Divider sx={{ my: 2 }} />

                {menuItem.options.map(option => (
                    <Box key={option.id} sx={{ my: 2 }}>
                        <Typography variant="h6">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {option.minChoices === 1 && option.maxChoices === 1 ? 'Choose 1' : `Choose between ${option.minChoices} and ${option.maxChoices}`}
                        </Typography>
                        
                        {option.maxChoices === 1 ? (
                            <RadioGroup
                                value={selections[option.id]?.[0] || ''}
                                onChange={(e) => handleRadioChange(option.id, e.target.value)}
                            >
                                {option.choices.map(choice => (
                                    <FormControlLabel key={choice.id} value={choice.id} control={<Radio />} label={choice.name} />
                                ))}
                            </RadioGroup>
                        ) : (
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
                        disabled={!isSelectionValid()}
                        startIcon={<AddShoppingCartIcon />}
                    >
                        {t('add')} to Cart
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
}

export default CustomizeItemModal;