import React, { createContext } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from "react";
import { mark, useControllable, type CommonProps, type Variant } from "../../core/base";
import { Icon } from "../layout/Icon/Icon";

export interface FieldContextValue { id:string; required?:boolean; error?:boolean; describedBy?:string }
/** Legacy context kept only so older internal controls compile; new code should compose Field/TextField directly. */
export const FieldContext=createContext<FieldContextValue|null>(null);

export interface ButtonProps extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps | "color"> { variant?:Variant; icon?:string; endIcon?:string; loading?:boolean; round?:boolean; label?:string; ref?:Ref<HTMLButtonElement> }
export function buttonView(p:ButtonProps,name="Button") { const {variant="secondary",icon,endIcon,loading,round,label,children,ref,...rest}=p; const {size:_s,tone:_t,material:_m,...dom}=rest; return <button {...dom} {...mark(name,p,{primary:"ruby",secondary:"glass",danger:"danger",ghost:"ghost"}[variant] as "glass")} ref={ref} type={p.type??"button"} disabled={p.disabled||loading} aria-busy={loading||undefined} data-ad-variant={variant} data-ad-round={round||undefined}>{loading&&<span className="ad-spinner" aria-hidden="true"/>}{icon&&<Icon name={icon}/>} {children??label} {endIcon&&<Icon name={endIcon}/>}</button> }
export interface IconButtonProps extends ButtonProps { label:string }
export interface ToggleButtonProps extends ButtonProps { checked?:boolean; defaultChecked?:boolean; onValueChange?:(value:boolean)=>void }
export interface SplitButtonProps extends CommonProps { variant?:Variant; icon?:string; label?:string; items?:any[]; onClick?:()=>void; children?:ReactNode }
export interface TabProps extends ButtonProps { selected?:boolean; panelId?:string }
export interface TabItem { value:string; label:ReactNode; icon?:string; disabled?:boolean; panelId?:string; id?:string }
export interface TabsProps extends CommonProps { items?:TabItem[]; value?:string; defaultValue?:string; onValueChange?:(value:string)=>void; label?:string }
export interface FieldProps extends CommonProps, Omit<InputHTMLAttributes<HTMLInputElement>, keyof CommonProps|"size"|"value"|"defaultValue"|"onChange"> { value?:string; defaultValue?:string; onValueChange?:(value:string)=>void; startAdornment?:ReactNode; endAdornment?:ReactNode; inputRef?:Ref<HTMLInputElement> }
export interface TextFieldProps extends FieldProps { label?:ReactNode; description?:ReactNode; error?:ReactNode; clearable?:boolean; type?:InputHTMLAttributes<HTMLInputElement>["type"] }
export interface NumberFieldProps extends Omit<TextFieldProps,"value"|"defaultValue"|"onValueChange"|"type"> { value?:number|""; defaultValue?:number|""; onValueChange?:(value:number|"")=>void }
export interface TextAreaProps extends Omit<CommonProps,"children">, Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>,"size"|"value"|"defaultValue"|"onChange"> { value?:string; defaultValue?:string; onValueChange?:(value:string)=>void; label?:ReactNode; description?:ReactNode; error?:ReactNode; startAdornment?:ReactNode; endAdornment?:ReactNode }
export interface AutocompleteOption { value:string; label:string }
export interface AutocompleteProps extends TextFieldProps { options?:Array<string|AutocompleteOption>; onOptionSelect?:(value:string)=>void }
export interface SelectOption { value:string; label:string; disabled?:boolean }
export interface SelectProps extends CommonProps { options?:Array<string|SelectOption>; value?:string; defaultValue?:string; onValueChange?:(value:string)=>void; label?:string; icon?:string; disabled?:boolean; required?:boolean; name?:string; ref?:Ref<HTMLSelectElement> }
export interface BooleanProps extends CommonProps { checked?:boolean; defaultChecked?:boolean; onValueChange?:(value:boolean)=>void; label?:ReactNode; disabled?:boolean; name?:string; required?:boolean }
export function BooleanControl({kind,...p}:BooleanProps&{kind:"Switch"|"Checkbox"}){const [checked,setChecked]=useControllable(p.checked,p.defaultChecked??false,p.onValueChange);return <label {...mark(kind,p)}><input name={p.name} type="checkbox" role={kind==="Switch"?"switch":undefined} checked={checked} disabled={p.disabled} required={p.required} onChange={e=>setChecked(e.currentTarget.checked)}/><span className="ad-toggle-track" aria-hidden="true"><i/></span><span>{p.label}</span></label>}
export interface SliderProps extends CommonProps { value?:number; defaultValue?:number; min?:number; max?:number; step?:number; label?:string; disabled?:boolean; onValueChange?:(value:number)=>void; ref?:Ref<HTMLInputElement> }
export interface FilePickerProps extends CommonProps { label?:string; description?:string; icon?:string; accept?:string; multiple?:boolean; onFiles?:(files:File[])=>void }
