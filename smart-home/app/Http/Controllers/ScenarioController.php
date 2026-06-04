<?php

namespace App\Http\Controllers;

use App\Models\Scenario;
use Illuminate\Http\Request;

class ScenarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Scenario::with(['triggerDevice', 'actionDevice'])->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'trigger_device_id' => 'required|exists:devices,id',
            'condition' => 'required|string',
            'trigger_value' => 'required|string',
            'action_device_id' => 'required|exists:devices,id',
            'action_value' => 'required|string',
        ]);

        $scenario = Scenario::create($validated);
        return response()->json($scenario, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Scenario $scenario)
    {
        return response()->json($scenario->load(['triggerDevice', 'actionDevice']));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Scenario $scenario)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Scenario $scenario)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        Scenario::destroy($id);
        return response()->json(['message' => 'Сценарій видалено']);
    }
}
