import { NextResponse } from 'next/server'
import { supabaseClient } from '@/lib/supabase'

type SubjectCreateRequest = {
  name: string
  description?: string
  parentSubjectId?: string | null
}

type SubjectUpdateRequest = {
  id: string
  name?: string
  description?: string
  parentSubjectId?: string | null
}

type SubjectDeleteRequest = {
  id: string
}

export async function POST(req: Request) {
  try {
    const json = await req.json()
    
    // Validate create request
    if (!json.name) {
      return NextResponse.json({
        error: 'Missing required field: name'
      }, { status: 400 })
    }
    
    // Create the subject in Supabase
    const { data, error } = await supabaseClient.from('subjects')
      .insert([{ 
        name: json.name,
        description: json.description || null,
        parent_subject_id: json.parentSubjectId || null
      }])
      .single()
    
    if (error) {
      return NextResponse.json({
        error: `Supabase error creating subject: ${error.message}`
      }, { status: 500 })
    }
    
    return NextResponse.json({
      subject: data
    })
  } catch (error) {
    console.error('Error creating subject:', error)
    return NextResponse.json({
      error: 'Internal server error while creating subject'
    }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const json = await req.json()
    
    // Validate update request
    if (!json.id || !json.name) {
      return NextResponse.json({
        error: 'Missing required fields: id and name'
      }, { status: 400 })
    }
    
    // Update the subject in Supabase
    const { data, error } = await supabaseClient.from('subjects')
      .update({
        name: json.name,
        description: json.description,
        parent_subject_id: json.parentSubjectId
      }, {
        match: { id: json.id }
      })
      .single()
    
    if (error) {
      return NextResponse.json({
        error: `Supabase error updating subject: ${error.message}`
      }, { status: 500 })
    }
    
    return NextResponse.json({
      subject: data
    })
  } catch (error) {
    console.error('Error updating subject:', error)
    return NextResponse.json({
      error: 'Internal server error while updating subject'
    }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const json = await req.json()
    
    // Validate deletion request
    if (!json.id) {
      return NextResponse.json({
        error: 'Missing required field: id'
      }, { status: 400 })
    }
    
    // Delete the subject from Supabase
    const { error } = await supabaseClient.from('subjects')
      .delete()
      .match({ id: json.id })
    
    if (error) {
      return NextResponse.json({
        error: `Supabase error deleting subject: ${error.message}`
      }, { status: 500 })
    }
    
    return NextResponse.json({
      message: 'Subject deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting subject:', error)
    return NextResponse.json({
      error: 'Internal server error while deleting subject'
    }, { status: 500 })
  }
}