import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Box, Typography, Button, Radio, RadioGroup, Checkbox, FormControlLabel, FormGroup, Divider, CircularProgress } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const style = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: '90%', maxWidth: 500, bgcolor: 'background.paper', border: '1px solid #ddd',
  borderRadius: 2, boxShadow: 24, p: 4, maxHeight: '90vh', overflowY: 'auto'
};

function CustomizeItemModal({ open, handleClose, initialMenuItem, handleAddToCart }) {
    const { t } = useTranslation();
    const [detailedItem, setDetailedItem] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selections, setSelections] = useState({});

    useEffect(() => {
        if (open && initialMenuItem) {
            const fetchDetailedItem = async () => {
                setIsLoading(true);
                setSelections({});
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/menu-items/${initialMenuItem.id}`);
                    if (!response.ok) throw new Error("Could not load item details.");
                    const data = await response.json();
                    setDetailedItem(data);
                } catch (error) { console.error(error); handleClose(); } 
                finally { setIsLoading(false); }
            };
            fetchDetailedItem();
        }
    }, [open, initialMenuItem, handleClose]);

    if (!initialMenuItem) return null;

    const handleRadioChange = (optionId, choiceId) => {
        setSelections(prev => ({ ...prev, [optionId]: [parseInt(choiceId)] }));
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
    
    const isSelectionValid = () => {
        if (!detailedItem || !detailedItem.options) return false;
        return detailedItem.options.every(option => {
            const selectedCount = selections[option.id]?.length || 0;
            return selectedCount >= option.minChoices && selectedCount <= option.maxChoices;
        });
    };

    const handleSubmit = () => {
        // ✅ THIS IS THE FIX: Create a simple array of strings
        const selectedOptionsForCart = detailedItem.options.flatMap(option => {
            const selectedChoiceIds = selections[option.id] || [];
            // Find the full choice objects for the selected IDs
            return option.choices
                .filter(choice => selectedChoiceIds.includes(choice.id))
                .map(choice => `${option.name}: ${choice.name}`); // Create the string
        });

        const itemForCart = { ...detailedItem, selectedOptions: selectedOptionsForCart };
        handleAddToCart(itemForCart);
        handleClose();
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h5">{initialMenuItem.name}</Typography>
                <Divider sx={{ my: 2 }} />
                {isLoading || !detailedItem ? <CircularProgress /> : (
                    <>
                        {detailedItem.options?.map(option => (
                            <Box key={option.id} sx={{ my: 2 }}>
                                <Typography variant="h6">{option.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {option.minChoices === 1 && option.maxChoices === 1 ? 'Choose 1' : `Choose between ${option.minChoices} and ${option.maxChoices}`}
                                </Typography>
                                {option.maxChoices === 1 ? (
                                    <RadioGroup value={selections[option.id]?.[0] || ''} onChange={(e) => handleRadioChange(option.id, e.target.value)}>
                                        {option.choices.map(choice => <FormControlLabel key={choice.id} value={choice.id} control={<Radio />} label={choice.name} />)}
                                    </RadioGroup>
                                ) : (
                                    <FormGroup>
                                        {option.choices.map(choice => <FormControlLabel key={choice.id} control={<Checkbox checked={selections[option.id]?.includes(choice.id) || false} onChange={() => handleCheckboxChange(option.id, choice.id)} disabled={(selections[option.id]?.length >= option.maxChoices) && !selections[option.id]?.includes(choice.id)} />} label={choice.name} />)}
                                    </FormGroup>
                                )}
                            </Box>
                        ))}
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={handleClose}>Cancel</Button>
                            <Button variant="contained" color="secondary" onClick={handleSubmit} disabled={!isSelectionValid()}>
                                Add to Cart
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    );
}

export default CustomizeItemModal;